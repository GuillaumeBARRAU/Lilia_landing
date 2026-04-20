import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const password = req.headers.get("x-admin-password");

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.downloadEvent.deleteMany();
    await prisma.downloadToken.deleteMany();
    await prisma.consent.deleteMany();
    await prisma.lead.deleteMany();

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("ADMIN RESET ERROR:", error);
    return NextResponse.json(
      { error: "Impossible de réinitialiser les leads" },
      { status: 500 }
    );
  }
}