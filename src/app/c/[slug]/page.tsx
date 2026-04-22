import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

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
    return notFound();
  }

  return (
    <main className="min-h-screen bg-[#FAF9F7] text-[#111111]">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-[#B8B2A8] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <img
              src="/lilia-photo.jpg"
              alt="Lilia Dieb"
              className="h-11 w-11 rounded-full border border-[#B8B2A8] object-cover"
            />
            <div>
              <p className="text-lg font-bold tracking-tight text-[#111111]">
                Lilia Dieb
              </p>
              <p className="text-xs uppercase tracking-[0.2em] text-[#6F6A63]">
                Immobilier Marseille
              </p>
            </div>
          </div>

          <a
            href="#formulaire"
            className="rounded-full bg-[#C26A4A] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
          >
            Recevoir le guide
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-2 md:items-center lg:py-24">
        {/* LEFT */}
        <div className="relative flex flex-col items-center">
          {/* PARTENAIRE */}
          <div className="mb-5 w-fit rounded-[1.75rem] border border-[#B8B2A8] bg-white px-6 py-5 shadow-[0_8px_30px_rgba(17,17,17,0.06)]">
            <p className="text-center text-xs font-medium uppercase tracking-[0.3em] text-[#C26A4A]">
              Partenaire
            </p>

            <div className="mt-4 flex items-center justify-center">
              <img
                src="/logo-partenaire.png"
                alt="Logo partenaire"
                className="h-24 w-auto object-contain md:h-28"
              />
            </div>
          </div>

          {/* IMAGE */}
          <div className="w-full overflow-hidden rounded-[2rem] border border-[#B8B2A8] bg-white shadow-[0_20px_60px_rgba(17,17,17,0.10)]">
            <img
              src="/lilia-photo.jpg"
              alt="Lilia Dieb - Immobilier Marseille"
              className="h-full w-full object-cover"
            />
          </div>

          {/* BADGE LOCAL */}
          <div className="absolute left-0 top-32 -translate-x-1/4 rounded-2xl border border-[#B8B2A8] bg-white px-5 py-3 shadow-[0_8px_24px_rgba(17,17,17,0.08)]">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#C26A4A]">
              Marseille
            </p>
            <p className="mt-1 text-sm font-semibold text-[#111111]">
              Expertise locale
            </p>
          </div>

          {/* BADGE GUIDE */}
          <div className="absolute -bottom-5 right-4 rounded-2xl border border-[#B8B2A8] bg-white px-5 py-4 shadow-[0_8px_24px_rgba(17,17,17,0.08)]">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#C26A4A]">
              Guide offert
            </p>
            <p className="mt-1 text-sm font-semibold text-[#111111]">
              Conseils pratiques + vision terrain
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div>
          <span className="inline-flex rounded-full border border-[#B8B2A8] bg-white px-4 py-1.5 text-sm text-[#6F6A63] shadow-sm">
            Guide immobilier gratuit
          </span>

          <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-[#111111] md:text-5xl">
            Gagnez du temps et avancez plus sereinement dans votre projet
            immobilier à Marseille.
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-8 text-[#6F6A63]">
            Recevez un guide clair et pratique pour mieux comprendre votre
            marché, éviter les erreurs fréquentes et prendre de meilleures
            décisions, avec une approche locale et humaine.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#formulaire"
              className="inline-flex items-center justify-center rounded-full bg-[#C26A4A] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
            >
              Télécharger le guide
            </a>
            <a
              href="#contenu"
              className="inline-flex items-center justify-center rounded-full border border-[#B8B2A8] bg-white px-6 py-3 text-sm font-medium text-[#111111] transition hover:bg-[#F6F1EC]"
            >
              Voir le contenu
            </a>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <MiniInfo text="Approche 100% locale" />
            <MiniInfo text="Conseils concrets et actionnables" />
            <MiniInfo text="Téléchargement sécurisé par email" />
            <MiniInfo text="Aucun spam, données protégées" />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-[#E7E1D8] bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-14 text-center md:grid-cols-3">
          <Stat value="+1" label="Marché ciblé : Marseille uniquement" />
          <Stat value="48h" label="Lien sécurisé envoyé par email" />
          <Stat value="+100%" label="Guide pensé pour mieux cadrer son projet" />
        </div>
      </section>

      {/* BENEFITS */}
      <section id="contenu" className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#C26A4A]">
            Ce que vous allez trouver
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#111111]">
            Un guide simple, utile et pensé pour mieux décider.
          </h2>
          <p className="mt-4 text-[#6F6A63]">
            Une lecture claire pour mieux comprendre votre projet immobilier,
            repérer les points de vigilance et avancer plus sereinement.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <FeatureCard
            title="Comprendre le marché"
            text="Mieux situer votre projet dans le contexte immobilier marseillais et éviter les décisions trop rapides."
          />
          <FeatureCard
            title="Éviter les erreurs fréquentes"
            text="Repérer les pièges les plus courants et adopter une démarche plus sereine."
          />
          <FeatureCard
            title="Passer à l’action"
            text="Savoir quoi préparer, dans quel ordre avancer et sur quels points concentrer votre attention."
          />
        </div>
      </section>

      {/* EXPERTISE + FORM */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#C26A4A]">
              Expertise locale
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#111111]">
              Une approche humaine et centrée sur Marseille.
            </h2>
            <p className="mt-4 leading-8 text-[#6F6A63]">
              L’objectif est de proposer une lecture terrain plus claire, plus
              concrète et plus adaptée aux réalités immobilières locales.
            </p>

            <div className="mt-6 space-y-3">
              <Bullet text="Vision terrain et accompagnement local" />
              <Bullet text="Conseils accessibles" />
              <Bullet text="Guide pratique et concret" />
            </div>
          </div>

          <div
            id="formulaire"
            className="rounded-[2rem] border border-[#B8B2A8] bg-[#FAF9F7] p-6 shadow-[0_20px_50px_rgba(17,17,17,0.08)] md:p-8"
          >
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#C26A4A]">
              Recevoir le guide
            </p>
            <h3 className="mt-3 text-2xl font-bold tracking-tight text-[#111111]">
              Téléchargement gratuit
            </h3>
            <p className="mt-2 text-sm leading-6 text-[#6F6A63]">
              Renseignez votre email pour recevoir votre lien sécurisé.
            </p>

            <form action="/api/leads" method="POST" className="mt-6 space-y-4">
              <input type="hidden" name="campaignSlug" value={campaign.slug} />

              <input
                name="firstName"
                placeholder="Prénom"
                className="w-full rounded-2xl border border-[#B8B2A8] bg-white p-3.5 outline-none transition focus:border-[#C26A4A]"
              />

              <select
                name="arrondissement"
                defaultValue=""
                className="w-full rounded-2xl border border-[#B8B2A8] bg-white p-3.5 outline-none transition focus:border-[#C26A4A]"
              >
                <option value="">Arrondissement de Marseille (optionnel)</option>
                <option value="13001">1er arrondissement (13001)</option>
                <option value="13002">2e arrondissement (13002)</option>
                <option value="13003">3e arrondissement (13003)</option>
                <option value="13004">4e arrondissement (13004)</option>
                <option value="13005">5e arrondissement (13005)</option>
                <option value="13006">6e arrondissement (13006)</option>
                <option value="13007">7e arrondissement (13007)</option>
                <option value="13008">8e arrondissement (13008)</option>
                <option value="13009">9e arrondissement (13009)</option>
                <option value="13010">10e arrondissement (13010)</option>
                <option value="13011">11e arrondissement (13011)</option>
                <option value="13012">12e arrondissement (13012)</option>
                <option value="13013">13e arrondissement (13013)</option>
                <option value="13014">14e arrondissement (13014)</option>
                <option value="13015">15e arrondissement (13015)</option>
                <option value="13016">16e arrondissement (13016)</option>
              </select>

              <input
                name="email"
                type="email"
                required
                placeholder="Email *"
                className="w-full rounded-2xl border border-[#B8B2A8] bg-white p-3.5 outline-none transition focus:border-[#C26A4A]"
              />

              <input
                name="phone"
                placeholder="Téléphone (optionnel)"
                className="w-full rounded-2xl border border-[#B8B2A8] bg-white p-3.5 outline-none transition focus:border-[#C26A4A]"
              />

              <input
                name="website"
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              <label className="flex items-start gap-3 text-sm text-[#6F6A63]">
                <input
                  type="checkbox"
                  name="privacyAccepted"
                  required
                  className="mt-1"
                />
                <span>J’accepte la politique de confidentialité.</span>
              </label>

              <label className="flex items-start gap-3 text-sm text-[#6F6A63]">
                <input
                  type="checkbox"
                  name="marketingAccepted"
                  className="mt-1"
                />
                <span>
                  J’accepte de recevoir des conseils et actualités immobilières.
                </span>
              </label>

              <button className="w-full rounded-full bg-[#C26A4A] py-3.5 text-sm font-medium text-white transition hover:opacity-90">
                Recevoir le guide
              </button>

              <p className="text-xs leading-5 text-[#6F6A63]">
                Lien envoyé par email • téléchargement sécurisé • aucun spam
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-8 rounded-[2rem] border border-[#B8B2A8] bg-white p-8 shadow-sm md:grid-cols-[220px_1fr] md:items-center">
          <div className="mx-auto md:mx-0">
            <img
              src="/lilia-photo.jpg"
              alt="Lilia Dieb"
              className="h-48 w-48 rounded-[2rem] object-cover shadow-md"
            />
          </div>

          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#C26A4A]">
              Votre contact
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#111111]">
              Une présence locale, une approche claire
            </h2>
            <p className="mt-4 leading-8 text-[#6F6A63]">
              Lilia Dieb accompagne les projets immobiliers à Marseille avec une
              approche accessible, structurée et orientée terrain. L’objectif :
              aider à mieux comprendre, mieux préparer et mieux avancer.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
     <footer className="border-t border-[#B8B2A8] bg-[#FAF9F7]">
  <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-8 text-sm text-[#6F6A63] md:flex-row md:items-center md:justify-between">
    <div className="flex flex-col gap-2">
      <p>© Lilia Dieb — Immobilier Marseille</p>
      <p>Guide gratuit • Téléchargement sécurisé • Données protégées</p>
    </div>

    <a
      href="https://aidezmoi.online/"
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-3 self-start rounded-full border border-[#B8B2A8] bg-white px-4 py-2 shadow-sm transition hover:border-[#C26A4A] hover:bg-[#FFFDFB]"
    >
      <img
        src="/bang-dev-logo.png"
        alt="BANG DEV"
        className="h-8 w-auto object-contain"
      />
      <span className="text-sm font-medium text-[#111111]">
        Créé par{" "}
        <span className="text-[#C26A4A] transition group-hover:opacity-80">
          BANG DEV
        </span>
      </span>
    </a>
  </div>
</footer>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-4xl font-bold tracking-tight text-[#111111]">{value}</p>
      <p className="mt-2 text-sm text-[#6F6A63]">{label}</p>
    </div>
  );
}

function FeatureCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[2rem] border border-[#B8B2A8] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="mb-4 h-11 w-11 rounded-2xl bg-[#F4E8DC]" />
      <h3 className="text-lg font-semibold tracking-tight text-[#111111]">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-7 text-[#6F6A63]">{text}</p>
    </div>
  );
}

function MiniInfo({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-[#B8B2A8] bg-white px-4 py-3 text-sm text-[#111111] shadow-sm">
      {text}
    </div>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[#C26A4A]" />
      <p className="text-[#6F6A63]">{text}</p>
    </div>
  );
}