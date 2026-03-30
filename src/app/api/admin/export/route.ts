import { prisma } from "@/lib/db";

function escapeCsv(value: string | null | undefined) {
  if (!value) return "";
  const escaped = value.replace(/"/g, '""');
  return `"${escaped}"`;
}

export async function GET() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    select: {
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
      consents: {
        select: {
          type: true,
          acceptedAt: true,
        },
      },
    },
  });

  const headers = [
    "prenom",
    "email",
    "telephone",
    "campagne",
    "slug_campagne",
    "date_creation",
    "consentements",
  ];

  const rows = leads.map((lead) => {
    const consentTypes = lead.consents.map((c) => c.type).join(" | ");

    return [
      escapeCsv(lead.firstName),
      escapeCsv(lead.email),
      escapeCsv(lead.phone),
      escapeCsv(lead.campaign.title),
      escapeCsv(lead.campaign.slug),
      escapeCsv(new Date(lead.createdAt).toISOString()),
      escapeCsv(consentTypes),
    ].join(",");
  });

  const csv = [headers.join(","), ...rows].join("\n");

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-export.csv"`,
    },
  });
}