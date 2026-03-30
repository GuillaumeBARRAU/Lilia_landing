import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const [leadCount, downloadCount, campaignCount, recentLeads] = await Promise.all([
    prisma.lead.count(),
    prisma.downloadEvent.count(),
    prisma.campaign.count(),
    prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        createdAt: true,
        campaign: {
          select: {
            title: true,
            slug: true,
          },
        },
      },
    }),
  ]);

  return NextResponse.json({
    kpis: {
      leadCount,
      downloadCount,
      campaignCount,
      conversionRate:
        leadCount > 0 ? Number(((downloadCount / leadCount) * 100).toFixed(2)) : 0,
    },
    recentLeads,
  });
}