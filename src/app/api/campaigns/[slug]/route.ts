import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;

  const campaign = await prisma.campaign.findUnique({
    where: { slug },
    select: { slug: true, title: true, description: true, isActive: true },
  });

  if (!campaign || !campaign.isActive) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(campaign);
}