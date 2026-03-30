import { NextResponse } from "next/server";
import { generateSignedPdfUrl } from "@/lib/s3";

export async function GET() {
  try {
    const key = process.env.S3_PDF_KEY!;
    const url = await generateSignedPdfUrl(key);

    return NextResponse.json({ url });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}