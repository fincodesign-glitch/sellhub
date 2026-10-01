import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { get, put } from "@vercel/blob";
import type { NextRequest, NextResponse } from "next/server";

// Server-only: site ID/password accounts and the signed session cookie.
// Accounts live in Vercel Blob (one private JSON file per ID). The master
// account and the session signing key come from environment variables so no
// credential material lives in the repository:
//   AUTH_SECRET          — random string that signs session cookies (required)
//   MASTER_ID            — master account ID
//   MASTER_PASSWORD_HASH — scrypt$<salt hex>$<hash hex> of the master password

export type Plan = "free" | "master";
export interface SessionUser {
  id: string;
  plan: Plan;
}

export const USER_COOKIE = "sh_session";
const SESSION_MS = 30 * 24 * 60 * 60 * 1000;

const RESERVED_IDS = new Set(["admin", "master", "sellhub", "root"]);

function masterId(): string | null {
  return process.env.MASTER_ID ? normalizeId(process.env.MASTER_ID) : null;
}

// Compared against when an ID doesn't exist, so a wrong ID takes as long as a wrong password.
const DUMMY_HASH = hashPassword("not-a-real-password");

function sessionSecret(): string | null {
  return process.env.AUTH_SECRET || null;
}

export function isLoginConfigured(): boolean {
  return sessionSecret() !== null;
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  return `scrypt$${salt}$${scryptSync(password, salt, 32).toString("hex")}`;
}

function verifyPasswordHash(password: string, stored: string): boolean {
  const [scheme, salt, hex] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hex) return false;
  const expected = Buffer.from(hex, "hex");
  const actual = scryptSync(password, salt, expected.length);
  return timingSafeEqual(actual, expected);
}

function sign(body: string, secret: string): string {
  return createHmac("sha256", secret).update(body).digest("base64url");
}

export function createSessionToken(user: SessionUser): string {
  const secret = sessionSecret();
  if (!secret) throw new Error("login is not configured");
  const body = Buffer.from(JSON.stringify({ id: user.id, plan: user.plan, exp: Date.now() + SESSION_MS })).toString(
    "base64url",
  );
  return `${body}.${sign(body, secret)}`;
}

export function readSessionToken(token: string | undefined | null): SessionUser | null {
  const secret = sessionSecret();
  if (!token || !secret) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = Buffer.from(sign(body, secret));
  const actual = Buffer.from(sig);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as {
      id?: unknown;
      plan?: unknown;
      exp?: unknown;
    };
    if (typeof data.id !== "string" || typeof data.exp !== "number" || data.exp < Date.now()) return null;
    const plan: Plan = data.plan === "master" ? "master" : "free";
    return { id: data.id, plan };
  } catch {
    return null;
  }
}

// Single sign-on to Searching Hub (searchinghub.vercel.app). It is a separate
// domain, so it can't read SellHub's cookie; instead SellHub hands over a
// short-lived token signed with HANDOFF_SECRET (set to the same value on both
// deployments), and Searching Hub turns it into its own session cookie.
const HANDOFF_AUDIENCE = "searchinghub";
const HANDOFF_TTL_MS = 60 * 1000;

export function createHandoffToken(user: SessionUser): string | null {
  const secret = process.env.HANDOFF_SECRET;
  if (!secret) return null;
  const body = Buffer.from(
    JSON.stringify({ id: user.id, plan: user.plan, aud: HANDOFF_AUDIENCE, exp: Date.now() + HANDOFF_TTL_MS }),
  ).toString("base64url");
  return `${body}.${sign(body, secret)}`;
}

export function readHandoffToken(token: string | null): SessionUser | null {
  const secret = process.env.HANDOFF_SECRET;
  if (!token || !secret) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = Buffer.from(sign(body, secret));
  const actual = Buffer.from(sig);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as {
      id?: unknown;
      plan?: unknown;
      aud?: unknown;
      exp?: unknown;
    };
    if (data.aud !== HANDOFF_AUDIENCE || typeof data.id !== "string") return null;
    if (typeof data.exp !== "number" || data.exp < Date.now()) return null;
    return { id: data.id, plan: data.plan === "master" ? "master" : "free" };
  } catch {
    return null;
  }
}

export function getSessionUser(request: NextRequest): SessionUser | null {
  return readSessionToken(request.cookies.get(USER_COOKIE)?.value);
}

export function setSessionCookie(response: NextResponse, user: SessionUser) {
  response.cookies.set(USER_COOKIE, createSessionToken(user), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MS / 1000,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(USER_COOKIE, "", { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 0 });
}

export function normalizeId(raw: unknown): string {
  return typeof raw === "string" ? raw.trim().toLowerCase() : "";
}

/** Returns an error message for the signup form, or null if the ID/password are acceptable. */
export function validateNewAccount(id: string, password: string): string | null {
  if (!/^[a-z0-9_]{4,20}$/.test(id)) return "아이디는 영문 소문자·숫자·밑줄(_)로 4~20자여야 합니다.";
  if (RESERVED_IDS.has(id) || id === masterId()) return "사용할 수 없는 아이디입니다.";
  if (password.length < 6 || password.length > 72) return "비밀번호는 6~72자여야 합니다.";
  return null;
}

interface StoredAccount {
  id: string;
  passwordHash: string;
  plan: Plan;
  createdAt: string;
}

const accountPath = (id: string) => `accounts/${id}.json`;

async function readAccount(id: string): Promise<StoredAccount | null> {
  const result = await get(accountPath(id), { access: "private", useCache: false });
  if (!result || result.statusCode !== 200) return null;
  return JSON.parse(await new Response(result.stream).text()) as StoredAccount;
}

/** "taken" if the ID already exists. Throws if account storage isn't available. */
export async function createAccount(id: string, password: string): Promise<"created" | "taken"> {
  if (await readAccount(id)) return "taken";
  const account: StoredAccount = { id, passwordHash: hashPassword(password), plan: "free", createdAt: new Date().toISOString() };
  try {
    await put(accountPath(id), JSON.stringify(account), {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: false,
    });
    return "created";
  } catch (err) {
    // Two signups racing for the same ID: the loser's write is rejected.
    if (await readAccount(id).catch(() => null)) return "taken";
    throw err;
  }
}

export async function authenticate(id: string, password: string): Promise<SessionUser | null> {
  const master = masterId();
  if (master && id === master) {
    const hash = process.env.MASTER_PASSWORD_HASH ?? "";
    return verifyPasswordHash(password, hash) ? { id, plan: "master" } : null;
  }
  const account = await readAccount(id).catch(() => null);
  if (!account) {
    verifyPasswordHash(password, DUMMY_HASH);
    return null;
  }
  return verifyPasswordHash(password, account.passwordHash) ? { id: account.id, plan: account.plan } : null;
}
