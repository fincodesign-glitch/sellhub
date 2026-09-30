import { randomBytes } from "crypto";
import { get, list, put } from "@vercel/blob";

// Server-only: "SellHub가 대신 진행" requests — recommended actions a paid user
// hands over to SellHub. One private JSON file per request in Vercel Blob.

export interface DelegationRequest {
  requestId: string;
  createdAt: string;
  requester: string;
  market: string;
  productName: string;
  keywords: string;
  productUrl: string;
  actions: { number: number; text: string }[];
}

const PREFIX = "delegations/";

export function newRequestId(now = new Date()): string {
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  return `SH-${date}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export async function saveDelegation(request: DelegationRequest): Promise<void> {
  await put(`${PREFIX}${request.requestId}.json`, JSON.stringify(request), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: false,
  });
}

export async function listDelegations(limit = 50): Promise<DelegationRequest[]> {
  const { blobs } = await list({ prefix: PREFIX, limit: 1000 });
  const newest = blobs
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    .slice(0, limit);
  const requests = await Promise.all(
    newest.map(async (blob) => {
      const result = await get(blob.pathname, { access: "private", useCache: false });
      if (!result || result.statusCode !== 200) return null;
      return JSON.parse(await new Response(result.stream).text()) as DelegationRequest;
    }),
  );
  return requests.filter((r): r is DelegationRequest => r !== null);
}
