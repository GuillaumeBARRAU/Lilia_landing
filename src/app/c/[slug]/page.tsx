import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

export default async function CampaignPage(
  props: { params: Promise<{ slug: string }> }
) {
  const { slug } = await props.params;

  const campaign = await prisma.campaign.findUnique({
    where: { slug },
    select: { slug: true, title: true, description: true, isActive: true },
  });

  if (!campaign || !campaign.isActive) return notFound();

  return (
    <main className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl p-8">
        <h1 className="text-2xl font-bold tracking-tight">{campaign.title}</h1>
        <p className="mt-3 text-zinc-600">{campaign.description}</p>

        <form action="/api/leads" method="POST" className="mt-8 space-y-4">
          <input type="hidden" name="campaignSlug" value={campaign.slug} />

          <input
            name="firstName"
            placeholder="Prénom (optionnel)"
            className="w-full rounded-lg border p-3"
          />

          <input
            name="email"
            type="email"
            placeholder="Email *"
            required
            className="w-full rounded-lg border p-3"
          />

          <input
            name="phone"
            placeholder="Téléphone (optionnel)"
            className="w-full rounded-lg border p-3"
          />

          <input name="website" className="hidden" tabIndex={-1} autoComplete="off" />

          <label className="flex items-start gap-2 text-sm text-zinc-700">
            <input type="checkbox" name="privacyAccepted" required />
            <span>J’accepte la politique de confidentialité.</span>
          </label>

          <button className="w-full rounded-lg bg-black py-3 text-white font-medium hover:opacity-90 transition">
            Recevoir le guide
          </button>
        </form>
      </div>
    </main>
  );
}