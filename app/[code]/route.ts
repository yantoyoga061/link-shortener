import { NextRequest, NextResponse } from "next/server";
import { getLink, incrementClick } from "@/lib/kv";

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const { code } = params;

  const record = await getLink(code);

  if (!record) {
    return NextResponse.redirect(new URL(`/?notfound=${code}`, req.url));
  }

  await incrementClick(code);

  return NextResponse.redirect(record.target);
}
