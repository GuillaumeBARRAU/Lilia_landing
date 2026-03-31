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
    allLeads,
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
        arrondissement: true,
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
        pdfKey: true,
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
    prisma.lead.findMany({
      select: {
        arrondissement: true,
      },
    }),
  ]);

  const conversionRate =
    leadCount > 0 ? Number(((downloadCount / leadCount) * 100).toFixed(2)) : 0;

  const arrondissementMap = new Map<string, number>();
  for (const lead of allLeads) {
    if (!lead.arrondissement) continue;
    arrondissementMap.set(
      lead.arrondissement,
      (arrondissementMap.get(lead.arrondissement) ?? 0) + 1
    );
  }

  const arrondissementStats = Array.from(arrondissementMap.entries())
    .map(([arrondissement, count]) => ({ arrondissement, count }))
    .sort((a, b) => b.count - a.count);

  const topCampaign =
    campaigns
      .map((campaign) => ({
        title: campaign.title,
        slug: campaign.slug,
        leads: campaign._count.leads,
        pdfKey: campaign.pdfKey,
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
      activeArrondissements: arrondissementStats.length,
    },
    recentLeads,
    arrondissementStats,
    topCampaign,
    campaigns,
  };
}

export default async function AdminPage() {
  const data = await getStats();

  return (
    <main className="min-h-screen bg-zinc-100">
      <div className="mx-auto max-w-7xl p-6 md:p-8">
        <header className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
              Dashboard
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-900">
              Pilotage de la landing
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-600">
              Suivi des leads, téléchargements, campagnes et zones les plus demandées.
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

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
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
                : "Aucune campagne"
            }
          />
          <StatCard
            title="Conversion"
            value={`${data.kpis.conversionRate}%`}
            subtitle="Téléchargements / leads"
          />
          <StatCard
            title="Arrondissements"
            value={data.kpis.activeArrondissements}
            subtitle="Zones actives"
          />
        </section>

        <section className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm xl:col-span-2">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-zinc-900">
                Derniers leads
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Contacts récents captés via la landing page.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-left text-zinc-500">
                    <th className="px-3 py-3 font-medium">Contact</th>
                    <th className="px-3 py-3 font-medium">Téléphone</th>
                    <th className="px-3 py-3 font-medium">Arrondissement</th>
                    <th className="px-3 py-3 font-medium">Campagne</th>
                    <th className="px-3 py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentLeads.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
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
                        <td className="px-3 py-4 text-zinc-700">
                          {lead.arrondissement || "—"}
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
                Arrondissements les plus demandés
              </h2>

              <div className="mt-4 space-y-3">
                {data.arrondissementStats?.length ? (
                  data.arrondissementStats
                    .slice(0, 5)
                    .map((item: { arrondissement: string; count: number }) => (
                      <div
                        key={item.arrondissement}
                        className="flex items-center justify-between border-b border-zinc-100 pb-3 last:border-b-0 last:pb-0"
                      >
                        <span className="text-sm text-zinc-600">
                          {item.arrondissement}
                        </span>
                        <span className="text-sm font-semibold text-zinc-900">
                          {item.count}
                        </span>
                      </div>
                    ))
                ) : (
                  <p className="text-sm text-zinc-500">
                    Aucun arrondissement renseigné pour le moment.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-zinc-900">
                Gestion des campagnes
              </h2>

              <div className="mt-4 space-y-4">
                {data.campaigns.length ? (
                  data.campaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-zinc-900">
                            {campaign.title}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            slug : {campaign.slug}
                          </p>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-zinc-700">
                          {campaign._count.leads} leads
                        </span>
                      </div>

                      <div className="mt-3 rounded-xl border border-zinc-200 bg-white p-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                          PDF actuel
                        </p>
                        <p className="mt-1 break-all text-sm text-zinc-700">
                          {campaign.pdfKey}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-zinc-500">
                    Aucune campagne disponible.
                  </p>
                )}
              </div>
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