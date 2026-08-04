import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { saveLink, codeExists } from "@/lib/kv";
import { checkRateLimit } from "@/lib/rate-limit";

const CODE_LENGTH = 6;
const MAX_ATTEMPTS = 5;

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function getClientIp(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rateLimit = await checkRateLimit(ip);

  if (!rateLimit.allowed) {
    const minutes = Math.ceil(rateLimit.resetInSeconds / 60);
    return NextResponse.json(
      {
        error: `Terlalu banyak permintaan. Coba lagi dalam ${minutes} menit.`,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.resetInSeconds),
        },
      }
    );
  }

  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Body request tidak valid." },
      { status: 400 }
    );
  }

  const target = body.url?.trim();

  if (!target) {
    return NextResponse.json(
      { error: "URL wajib diisi." },
      { status: 400 }
    );
  }

  if (!isValidUrl(target)) {
    return NextResponse.json(
      { error: "URL tidak valid. Gunakan format http:// atau https://" },
      { status: 400 }
    );
  }

  let code = "";
  let attempts = 0;
  do {
    code = nanoid(CODE_LENGTH);
    attempts += 1;
    if (attempts > MAX_ATTEMPTS) {
      return NextResponse.json(
        { error: "Gagal membuat kode unik, coba lagi." },
        { status: 500 }
      );
    }
  } while (await codeExists(code));

  await saveLink(code, target);

  const origin = req.nextUrl.origin;

  return NextResponse.json({
    code,
    shortUrl: `${origin}/${code}`,
    target,
  });
}
