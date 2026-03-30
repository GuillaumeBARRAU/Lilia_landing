export default function LoginPage() {
  return (
    <main className="min-h-screen bg-zinc-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-zinc-900">Connexion admin</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Accès réservé au tableau de bord.
        </p>

        <form action="/api/admin/login" method="POST" className="mt-6 space-y-4">
          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            required
            className="w-full rounded-xl border border-zinc-300 p-3 outline-none focus:border-zinc-500"
          />

          <button className="w-full rounded-xl bg-black py-3 text-white font-medium hover:opacity-90 transition">
            Se connecter
          </button>
        </form>
      </div>
    </main>
  );
}