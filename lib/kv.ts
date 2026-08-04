import { kv } from "@vercel/kv";

export const KEY_PREFIX = "url:";
export const CLICK_PREFIX = "clicks:";

export type LinkRecord = {
  target: string;
  createdAt: number;
};

export async function saveLink(code: string, target: string) {
  const record: LinkRecord = { target, createdAt: Date.now() };
  await kv.set(`${KEY_PREFIX}${code}`, record);
  return record;
}

export async function getLink(code: string): Promise<LinkRecord | null> {
  const record = await kv.get<LinkRecord>(`${KEY_PREFIX}${code}`);
  return record ?? null;
}

export async function codeExists(code: string) {
  const val = await kv.get(`${KEY_PREFIX}${code}`);
  return val !== null;
}

export async function incrementClick(code: string) {
  await kv.incr(`${CLICK_PREFIX}${code}`);
}

export { kv };
