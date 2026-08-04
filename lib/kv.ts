import { kv } from "@vercel/kv";

export const KEY_PREFIX = "url:";
export const CLICK_PREFIX = "clicks:";
export const INDEX_KEY = "links:index";
export const MAX_LISTED_LINKS = 200;

export type LinkRecord = {
  target: string;
  createdAt: number;
};

export type LinkWithStats = LinkRecord & {
  code: string;
  clicks: number;
};

export async function saveLink(code: string, target: string) {
  const record: LinkRecord = { target, createdAt: Date.now() };
  await kv.set(`${KEY_PREFIX}${code}`, record);
  await kv.zadd(INDEX_KEY, { score: record.createdAt, member: code });
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

// Ambil link terbaru dari index, urut dari yang paling baru dibuat.
export async function getAllLinks(
  limit = MAX_LISTED_LINKS
): Promise<LinkWithStats[]> {
  const codes = await kv.zrange<string[]>(INDEX_KEY, 0, limit - 1, {
    rev: true,
  });

  if (!codes || codes.length === 0) return [];

  const results = await Promise.all(
    codes.map(async (code) => {
      const [record, clicks] = await Promise.all([
        kv.get<LinkRecord>(`${KEY_PREFIX}${code}`),
        kv.get<number>(`${CLICK_PREFIX}${code}`),
      ]);
      if (!record) return null;
      return {
        code,
        target: record.target,
        createdAt: record.createdAt,
        clicks: clicks ?? 0,
      };
    })
  );

  return results.filter((item): item is LinkWithStats => item !== null);
}

export { kv };
