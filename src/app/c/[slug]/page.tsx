import { prisma } from "@/lib/db";

export default async function CampaignPage(
  props: { params: Promise<{ slug: string }> }
) {
  const { slug } = await props.params;

  const campaign = await prisma.campaign.findUnique({
    where: { slug },
    select: {
      slug: true,
      title: true,
      description: true,
      isActive: true,
    },
  });

  if (!campaign || !campaign.isActive) {
    return <div className="p-10">Campagne introuvable</div>;
  }

  return (
    <main className="bg-zinc-50 min-h-screen">

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">

        {/* LEFT IMAGE */}
        <div className="relative">
          <div className="rounded-3xl overflow-hidden shadow-xl">
            <img
              src="/hero-immo.jpg"
              alt="Immobilier Marseille"
              className="w-full h-full object-cover"
            />
          </div>

          {/* floating card */}
          <div className="absolute -bottom-6 -left-6 bg-white shadow-lg rounded-2xl p-4 text-sm">
            📍 Spécialiste Marseille
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight text-zinc-900">
            Gagnez du temps et sécurisez votre projet immobilier à Marseille.
          </h1>

          <p className="mt-4 text-lg text-zinc-600">
            Recevez gratuitement un guide pratique pour comprendre votre marché,
            éviter les erreurs et avancer sereinement.
          </p>

          {/* FORM */}
          <form
            action="/api/leads"
            method="POST"
            className="mt-6 space-y-4 bg-white p-6 rounded-2xl shadow"
          >
            <input type="hidden" name="campaignSlug" value={campaign.slug} />

            <input
              name="firstName"
              placeholder="Prénom"
              className="w-full border p-3 rounded-xl"
            />

            <input
              name="email"
              required
              placeholder="Email"
              className="w-full border p-3 rounded-xl"
            />

            <input
              name="phone"
              placeholder="Téléphone (optionnel)"
              className="w-full border p-3 rounded-xl"
            />

            <label className="flex gap-2 text-sm">
              <input type="checkbox" name="privacyAccepted" required />
              J’accepte la politique de confidentialité
            </label>

            <label className="flex gap-2 text-sm">
              <input type="checkbox" name="marketingAccepted" />
              Recevoir des conseils immobiliers
            </label>

            <button className="w-full bg-black text-white py-3 rounded-xl font-medium hover:opacity-90">
              Télécharger le guide
            </button>
          </form>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          <Stat value="+100%" label="Projets accompagnés" />
          <Stat value="+50%" label="Gain de temps moyen" />
          <Stat value="+30%" label="Décisions plus rapides" />
        </div>
      </section>

      {/* CONTENT */}
      <section className="py-16 max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">
        <Feature
          title="Comprendre votre marché"
          text="Analyse locale spécifique à Marseille"
        />
        <Feature
          title="Éviter les erreurs"
          text="Les pièges fréquents à éviter"
        />
        <Feature
          title="Passer à l’action"
          text="Un plan concret pour avancer"
        />
      </section>

    </main>
  );
}

function Stat({ value, label }: any) {
  return (
    <div>
      <p className="text-4xl font-bold text-zinc-900">{value}</p>
      <p className="text-zinc-500 mt-2">{label}</p>
    </div>
  );
}

function Feature({ title, text }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-zinc-600 mt-2">{text}</p>
    </div>
  );
}