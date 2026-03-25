import { NextRequest, NextResponse } from "next/server";

function isPdfFile(bytes: ArrayBuffer) {
  const header = new Uint8Array(bytes).subarray(0, 4);
  return (
    header[0] === 0x25 && // %
    header[1] === 0x50 && // P
    header[2] === 0x44 && // D
    header[3] === 0x46 // F
  );
}

function buildCloudinaryPdfCandidates(url: string): string[] {
  if (!url) return [];
  if (!url.includes("res.cloudinary.com")) return [url];

  const candidates: string[] = [];
  const add = (u: string) => {
    if (!u) return;
    if (!candidates.includes(u)) candidates.push(u);
  };

  // Already a PDF export attempt? Keep it as first candidate.
  if (url.includes("f_pdf")) add(url);

  // Prefer precise replacement for image URLs.
  if (url.includes("/image/upload/")) {
    add(url.replace("/image/upload/", "/image/upload/fl_attachment:Certificate,f_pdf/"));
    add(url.replace("/image/upload/", "/image/upload/f_pdf/"));
    add(url.replace("/image/upload/", "/image/upload/fl_attachment:Certificate/f_pdf/"));
    add(url.replace("/image/upload/", "/image/upload/f_pdf/fl_attachment:Certificate/"));
  }

  // Fallback for any other resource type.
  if (url.includes("/upload/")) {
    add(url.replace("/upload/", "/upload/fl_attachment:Certificate,f_pdf/"));
    add(url.replace("/upload/", "/upload/f_pdf/"));
  }

  // Remove the original image URL if we added variants, because it won't be a PDF.
  if (candidates.length > 1) {
    const filtered = candidates.filter((c) => c.includes("f_pdf"));
    return filtered.length ? filtered : candidates;
  }

  return candidates;
}

function sanitizeFileName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_-]/g, "") || "Applicant";
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  const name = request.nextUrl.searchParams.get("name") || "Applicant";

  if (!url) {
    return NextResponse.json({ error: "Missing certificate URL." }, { status: 400 });
  }

  if (!url.includes("res.cloudinary.com")) {
    return NextResponse.json({ error: "Invalid certificate URL source." }, { status: 400 });
  }

  const candidates = buildCloudinaryPdfCandidates(url);
  if (candidates.length === 0) {
    return NextResponse.json({ error: "Invalid certificate URL." }, { status: 400 });
  }

  const fileName = `Certificate_${sanitizeFileName(name)}.pdf`;

  for (const candidate of candidates) {
    try {
      const upstream = await fetch(candidate, { cache: "no-store", redirect: "follow" });
      if (!upstream.ok) continue;

      const bytes = await upstream.arrayBuffer();
      if (!isPdfFile(bytes)) continue;

      return new NextResponse(bytes, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${fileName}"`,
          "Cache-Control": "no-store",
        },
      });
    } catch {
      // Try next candidate
    }
  }

  return NextResponse.json(
    {
      error: "Unable to fetch certificate PDF. Please try again.",
    },
    { status: 502 }
  );
}
