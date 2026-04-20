"use client";

import { useState } from "react";

export default function AdminResetButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleReset() {
    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer tous les leads de test ?"
    );

    if (!confirmed) return;

    const password = window.prompt("Entrez le mot de passe admin");
    if (!password) return;

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/reset", {
        method: "POST",
        headers: {
          "x-admin-password": password,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur inconnue");
      }

      setMessage("Les leads de test ont bien été supprimés.");
      window.location.reload();
    } catch (error) {
      console.error(error);
      setMessage("Erreur lors de la suppression.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={handleReset}
        disabled={loading}
        className="inline-flex items-center justify-center rounded-2xl border border-[#C26A4A] bg-white px-4 py-3 text-sm font-medium text-[#C26A4A] shadow-sm transition hover:bg-[#FAF9F7] disabled:opacity-50"
      >
        {loading ? "Suppression..." : "Réinitialiser les leads"}
      </button>

      {message ? (
        <p className="mt-2 text-sm text-[#111111]">{message}</p>
      ) : null}
    </div>
  );
}