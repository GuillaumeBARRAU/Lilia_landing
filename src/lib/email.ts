export async function sendDownloadEmail({
  to,
  token,
  campaignTitle,
}: {
  to: string;
  token: string;
  campaignTitle: string;
}) {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/d/${token}`;

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY!,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: {
        email: process.env.BREVO_SENDER_EMAIL,
        name: process.env.BREVO_SENDER_NAME,
      },
      to: [{ email: to }],
      subject: `Voici ton guide : ${campaignTitle}`,
      htmlContent: `
        <h2>Merci !</h2>
        <p>Clique ici pour télécharger ton guide :</p>
        <p><a href="${url}">${url}</a></p>
        <p>Ce lien expire sous 48h.</p>
      `,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    console.error("Brevo error:", error);
  }
}