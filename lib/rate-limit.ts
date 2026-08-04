import { kv } from "@/lib/kv";

const WINDOW_SECONDS = 60 * 60; // jendela waktu: 1 jam
const MAX_REQUESTS = 20; // maksimal 20 link baru per IP per jam

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
};

export async function checkRateLimit(
  identifier: string
): Promise<RateLimitResult> {
  const key = `ratelimit:shorten:${identifier}`;

  const count = await kv.incr(key);

  // Baru pertama kali kena hit dalam window ini -> pasang TTL.
  if (count === 1) {
    await kv.expire(key, WINDOW_SECONDS);
  }

  const ttl = await kv.ttl(key);
  const resetInSeconds = ttl && ttl > 0 ? ttl : WINDOW_SECONDS;

  return {
    allowed: count <= MAX_REQUESTS,
    remaining: Math.max(0, MAX_REQUESTS - count),
    resetInSeconds,
  };
}
