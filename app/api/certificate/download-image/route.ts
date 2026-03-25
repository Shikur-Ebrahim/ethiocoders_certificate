import { NextRequest, NextResponse } from "next/server";

function sanitizeFileName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_-]/g, "") || "Applicant";
}

function extFromContentType(contentType: string | null): string {
  const ct = (contentType || "").toLowerCase();
  if (ct.includes("png")) return "png";
  if (ct.includes("jpeg") || ct.includes("jpg")) return "jpg";
  if (ct.includes("webp")) return "webp";
  if (ct.includes("gif")) return "gif";
  return "jpg";
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  const name = request.nextUrl.searchParams.get("name") || "Applicant";

  if (!url) {
    return NextResponse.json({ error: "Missing certificate URL." }, { status: 400 });
  }

  let parsed: URL | null = null;
  try {
    parsed = new URL(url);
  } catch {
    parsed = null;
  }

  if (!parsed || parsed.hostname !== "res.cloudinary.com") {
    return NextResponse.json({ error: "Invalid certificate URL source." }, { status: 400 });
  }

  try {
    const upstream = await fetch(url, { cache: "no-store", redirect: "follow" });
    if (!upstream.ok) {
      return NextResponse.json({ error: "Unable to fetch certificate image." }, { status: 502 });
    }

    const contentType = upstream.headers.get("content-type");
    const bytes = await upstream.arrayBuffer();
    const ext = extFromContentType(contentType);
    const fileName = `Certificate_${sanitizeFileName(name)}.${ext}`;

    return new NextResponse(bytes, {
      headers: {
        "Content-Type": contentType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to download certificate image. Please try again." },
      { status: 500 }
    );
  }
}

