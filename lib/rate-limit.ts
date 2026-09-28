// Lightweight in-memory rate limiter for a low-traffic public demo deployment.
// Not distributed — on serverless platforms each warm instance has its own
// counters, so this is a best-effort cost guard, not a hard guarantee.

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const PER_IP_LIMIT = 5;
const GLOBAL_LIMIT = 60;

const ipHits = new Map<string, number[]>();
let globalHits: number[] = [];

function prune(timestamps: number[], now: number): number[] {
  return timestamps.filter((t) => now - t < WINDOW_MS);
}

export function checkRateLimit(ip: string): { allowed: boolean; retryAfterMinutes: number } {
  const now = Date.now();

  globalHits = prune(globalHits, now);
  if (globalHits.length >= GLOBAL_LIMIT) {
    return { allowed: false, retryAfterMinutes: 60 };
  }

  const existing = prune(ipHits.get(ip) ?? [], now);
  if (existing.length >= PER_IP_LIMIT) {
    const oldestInWindow = existing[0];
    const retryAfterMinutes = Math.max(1, Math.ceil((WINDOW_MS - (now - oldestInWindow)) / 60000));
    ipHits.set(ip, existing);
    return { allowed: false, retryAfterMinutes };
  }

  existing.push(now);
  globalHits.push(now);
  ipHits.set(ip, existing);
  return { allowed: true, retryAfterMinutes: 0 };
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
