// Lightweight in-memory rate limiter for a low-traffic public demo deployment.
// Not distributed — on serverless platforms each warm instance has its own
// counters, so this is a best-effort cost guard, not a hard guarantee.

function prune(timestamps: number[], now: number, windowMs: number): number[] {
  return timestamps.filter((t) => now - t < windowMs);
}

export function createRateLimiter({ windowMs, perIp, global }: { windowMs: number; perIp: number; global: number }) {
  const ipHits = new Map<string, number[]>();
  let globalHits: number[] = [];

  return function check(
    ip: string,
    { skipPerIp = false }: { skipPerIp?: boolean } = {},
  ): { allowed: boolean; retryAfterMinutes: number } {
    const now = Date.now();

    globalHits = prune(globalHits, now, windowMs);
    if (globalHits.length >= global) {
      return { allowed: false, retryAfterMinutes: Math.ceil(windowMs / 60000) };
    }

    const existing = prune(ipHits.get(ip) ?? [], now, windowMs);
    if (!skipPerIp && existing.length >= perIp) {
      const oldestInWindow = existing[0];
      const retryAfterMinutes = Math.max(1, Math.ceil((windowMs - (now - oldestInWindow)) / 60000));
      ipHits.set(ip, existing);
      return { allowed: false, retryAfterMinutes };
    }

    existing.push(now);
    globalHits.push(now);
    ipHits.set(ip, existing);
    return { allowed: true, retryAfterMinutes: 0 };
  };
}

/** Analysis requests: 5 per IP and 60 overall per hour. */
export const checkRateLimit = createRateLimiter({ windowMs: 60 * 60 * 1000, perIp: 5, global: 60 });

/** Login and signup attempts: slows password guessing, including against the master account. */
export const checkAuthRateLimit = createRateLimiter({ windowMs: 10 * 60 * 1000, perIp: 10, global: 300 });

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
