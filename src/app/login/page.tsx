import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function LoginPage(
  props: { searchParams: Promise<{ error?: string | string[] }> }
) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  if (session?.value === "authenticated") {
    redirect("/admin");
  }

  const sp = await props.searchParams;
  const error = Array.isArray(sp.error) ? sp.error[0] : sp.error;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAF9F7] px-6">
      <div className="w-full max-w-md rounded-[2rem] border border-[#B8B2A8] bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#C26A4A]">
          Administration
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#111111]">
          Connexion
        </h1>

        <p className="mt-3 text-sm text-[#6f6a63]">
          Entrez le mot de passe pour accéder au dashboard.
        </p>

        {error === "invalid" ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Mot de passe incorrect.
          </div>
        ) : null}

        <form action="/api/admin/login" method="POST" className="mt-6 space-y-4">
          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            required
            className="w-full rounded-2xl border border-[#B8B2A8] bg-white p-3.5 outline-none transition focus:border-[#C26A4A]"
          />

          <button className="w-full rounded-full bg-[#C26A4A] py-3.5 text-sm font-medium text-white transition hover:opacity-90">
            Se connecter
          </button>
        </form>
      </div>
    </main>
  );
}