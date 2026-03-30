import { prisma } from "@/lib/db";

function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date));
}

async function getStats() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    leadCount,
    downloadCount,
    campaignCount,
    recentLeads,
    todayLeadCount,
    todayDownloadCount,
    campaigns,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.downloadEvent.count(),
    prisma.campaign.count(),
    prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 12,
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
    prisma.lead.count({
      where: {
        createdAt: {
          gte: todayStart,
        },
      },
    }),
    prisma.downloadEvent.count({
      where: {
        createdAt: {
          gte: todayStart,
        },
      },
    }),
    prisma.campaign.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        _count: {
          select: {
            leads: true,
            tokens: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  const conversionRate =
    leadCount > 0 ? Number(((downloadCount / leadCount) * 100).toFixed(2)) : 0;

  const topCampaign = campaigns
    .map((campaign) => ({
      title: campaign.title,
      slug: campaign.slug,
      leads: campaign._count.leads,
    }))
    .sort((a, b) => b.leads - a.leads)[0] ?? null;

  return {
    kpis: {
      leadCount,
      downloadCount,
      campaignCount,
      conversionRate,
      todayLeadCount,
      todayDownloadCount,
    },
    recentLeads,
    topCampaign,
  };
}

export default async function AdminPage() {
  const data = await getStats();

  return (
    <main className="min-h-screen bg-zinc-100">
      <div className="mx-auto max-w-7xl p-6 md:p-8">
        <header className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
  <div>
    <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
      Dashboard
    </p>
    <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-900">
      Statistiques de la landing
    </h1>
    <p className="mt-2 text-sm text-zinc-600">
      Vue d’ensemble des leads, téléchargements et performances.
    </p>
  </div>

  <div className="flex flex-col gap-3 sm:flex-row">
    <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600 shadow-sm">
      Dernière mise à jour : {formatDate(new Date())}
    </div>

    <a
      href="/api/admin/export"
      className="inline-flex items-center justify-center rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white hover:opacity-90 transition"
    >
      Export CSV
    </a>

    <form action="/api/admin/logout" method="POST">
      <button className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600 shadow-sm hover:bg-zinc-50 transition">
        Déconnexion
      </button>
    </form>
  </div>
</header>
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Leads totaux"
            value={data.kpis.leadCount}
            subtitle={`${data.kpis.todayLeadCount} aujourd’hui`}
          />
          <StatCard
            title="Téléchargements"
            value={data.kpis.downloadCount}
            subtitle={`${data.kpis.todayDownloadCount} aujourd’hui`}
          />
          <StatCard
            title="Campagnes"
            value={data.kpis.campaignCount}
            subtitle={
              data.topCampaign
                ? `Top : ${data.topCampaign.title}`
                : "Aucune campagne dominante"
            }
          />
          <StatCard
            title="Conversion"
            value={`${data.kpis.conversionRate}%`}
            subtitle="Téléchargements / leads"
          />
        </section>

        <section className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm xl:col-span-2">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-zinc-900">
                  Derniers leads
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Les contacts les plus récents enregistrés via la landing.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-left text-zinc-500">
                    <th className="px-3 py-3 font-medium">Contact</th>
                    <th className="px-3 py-3 font-medium">Téléphone</th>
                    <th className="px-3 py-3 font-medium">Campagne</th>
                    <th className="px-3 py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentLeads.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-3 py-8 text-center text-zinc-500"
                      >
                        Aucun lead pour le moment.
                      </td>
                    </tr>
                  ) : (
                    data.recentLeads.map((lead) => (
                      <tr
                        key={lead.id}
                        className="border-b border-zinc-100 transition hover:bg-zinc-50"
                      >
                        <td className="px-3 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-zinc-900">
                              {lead.firstName || "Sans prénom"}
                            </span>
                            <span className="text-zinc-500">{lead.email}</span>
                          </div>
                        </td>
                        <td className="px-3 py-4 text-zinc-700">
                          {lead.phone || "—"}
                        </td>
                        <td className="px-3 py-4">
                          <span className="inline-flex rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
                            {lead.campaign.title}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-zinc-500">
                          {formatDate(lead.createdAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-zinc-900">
                Résumé rapide
              </h2>
              <div className="mt-4 space-y-4">
                <InfoRow
                  label="Leads aujourd’hui"
                  value={String(data.kpis.todayLeadCount)}
                />
                <InfoRow
                  label="Téléchargements aujourd’hui"
                  value={String(data.kpis.todayDownloadCount)}
                />
                <InfoRow
                  label="Conversion globale"
                  value={`${data.kpis.conversionRate}%`}
                />
                <InfoRow
                  label="Campagne la plus active"
                  value={data.topCampaign?.title ?? "Aucune"}
                />
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-zinc-900">
                Prochaines évolutions
              </h2>
              <ul className="mt-4 space-y-3 text-sm text-zinc-600">
                <li>• filtre par campagne</li>
                <li>• statistiques par arrondissement Marseille</li>
                <li>• export CSV des leads</li>
                <li>• protection par mot de passe</li>
              </ul>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string | number;
  subtitle: string;
}) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-zinc-500">{title}</p>
      <p className="mt-3 text-3xl font-bold tracking-tight text-zinc-900">
        {value}
      </p>
      <p className="mt-2 text-sm text-zinc-500">{subtitle}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-zinc-100 pb-3 last:border-b-0 last:pb-0">
      <span className="text-sm text-zinc-500">{label}</span>
      <span className="text-sm font-semibold text-zinc-900">{value}</span>
    </div>
  );
}

