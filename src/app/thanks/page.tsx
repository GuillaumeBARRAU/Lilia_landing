export default function ThanksPage() {
  return (
    <main className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl p-8">
        <h1 className="text-2xl font-bold tracking-tight">Merci ✅</h1>
        <p className="mt-3 text-zinc-600">
          Le lien de téléchargement vient d’être envoyé par email.
        </p>

        <div className="mt-6 rounded-xl border bg-zinc-50 p-4 text-sm text-zinc-700">
          <p className="font-medium">Si tu ne le vois pas :</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Vérifie tes spams / indésirables</li>
            <li>Attends 1 à 2 minutes</li>
            <li>Assure-toi que l’adresse email est correcte</li>
          </ul>
        </div>

        <a
          href="/c/guide-achat"
          className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-black py-3 text-white font-medium hover:opacity-90 transition"
        >
          Refaire une demande
        </a>
      </div>
    </main>
  );
}