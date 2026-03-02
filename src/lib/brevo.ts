export async function sendDownloadEmail(params: {
  toEmail: string;
  toName?: string | null;
  downloadUrl: string;
  campaignTitle: string;
}) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME;

  if (!apiKey) throw new Error("BREVO_API_KEY missing");
  if (!senderEmail) throw new Error("BREVO_SENDER_EMAIL missing");
  if (!senderName) throw new Error("BREVO_SENDER_NAME missing");

  const hello = params.toName?.trim() ? `Bonjour ${params.toName.trim()},` : "Bonjour,";

  const htmlContent = `
  <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111">
    <h2 style="margin:0 0 12px 0;">Votre guide est prêt ✅</h2>
    <p style="margin:0 0 12px 0;">${hello}</p>

    <p style="margin:0 0 16px 0;">
      Merci pour votre demande. Cliquez sur le bouton ci-dessous pour télécharger :
    </p>

    <p style="margin:0 0 18px 0;">
      <a href="${params.downloadUrl}"
         style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 16px;border-radius:10px;">
         Télécharger le guide
      </a>
    </p>

    <p style="margin:0 0 8px 0;font-size:12px;color:#555;">
      Lien sécurisé (expire sous 48h).
    </p>

    <hr style="border:none;border-top:1px solid #eee;margin:18px 0;" />

    <p style="margin:0;font-size:12px;color:#777;">
      Si vous n’êtes pas à l’origine de cette demande, ignorez simplement cet email.
    </p>
  </div>
  `;

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: { email: senderEmail, name: senderName },
      to: [{ email: params.toEmail, name: params.toName ?? undefined }],
      subject: `Votre guide : ${params.campaignTitle}`,
      htmlContent,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Brevo error ${res.status}: ${text}`);
  }
}