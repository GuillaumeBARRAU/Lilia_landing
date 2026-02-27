import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";
import { sendDownloadEmail } from "@/lib/brevo";

function randomToken() {
  return crypto.randomBytes(32).toString("hex");
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  const form = await req.formData();

  // Honeypot anti-bot
  const website = String(form.get("website") ?? "");
  if (website) return NextResponse.json({ ok: true });

  const campaignSlug = String(form.get("campaignSlug") ?? "").trim();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const phone = String(form.get("phone") ?? "").trim();
  const firstName = String(form.get("firstName") ?? "").trim();
  const privacyAccepted = form.get("privacyAccepted") != null;
  const marketingAccepted = form.get("marketingAccepted") != null;

  if (!campaignSlug) return NextResponse.json({ error: "Missing campaignSlug" }, { status: 400 });
  if (!privacyAccepted) return NextResponse.json({ error: "Privacy consent required" }, { status: 400 });
  if (!email || !isValidEmail(email)) return NextResponse.json({ error: "Valid email required" }, { status: 400 });

  const campaign = await prisma.campaign.findUnique({
    where: { slug: campaignSlug },
    select: { id: true, isActive: true, title: true },
  });

  if (!campaign || !campaign.isActive) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  const now = new Date();

  // 1) Anti spam : si un token valide récent existe, on ne recrée pas tout
  // et on évite d'envoyer un email si ça vient d’être fait (cooldown 2 min)
  const cooldownAgo = new Date(Date.now() - 2 * 60 * 1000);

  const recentLead = await prisma.lead.findFirst({
    where: {
      campaignId: campaign.id,
      email,
      createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) },
    },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  if (recentLead) {
    const existingToken = await prisma.downloadToken.findFirst({
      where: {
        leadId: recentLead.id,
        expiresAt: { gt: now },
        createdAt: { gte: cooldownAgo }, // token créé récemment
      },
      orderBy: { createdAt: "desc" },
      select: { token: true, createdAt: true },
    });

    if (existingToken) {
      // On ne renvoie pas d'email ici (cooldown), on renvoie juste /thanks
      return NextResponse.redirect(new URL(`/thanks`, req.url));
    }
  }

  // 2) Création lead + token (transaction)
  const tokenValue = randomToken();
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48h

  const { lead, token } = await prisma.$transaction(async (tx) => {
    const createdLead = await tx.lead.create({
      data: {
        campaignId: campaign.id,
        email,
        phone: phone || null,
        firstName: firstName || null,
        consents: {
          create: [
            {
              type: "PRIVACY",
              proof: {
                version: "v1",
                source: "landing-form",
                at: new Date().toISOString(),
              },
            },
            ...(marketingAccepted
              ? [
                  {
                    type: "MARKETING",
                    proof: {
                      version: "v1",
                      source: "landing-form",
                      at: new Date().toISOString(),
                    },
                  },
                ]
              : []),
          ],
        },
      },
      select: { id: true, email: true, firstName: true },
    });

    const createdToken = await tx.downloadToken.create({
      data: {
        token: tokenValue,
        leadId: createdLead.id,
        campaignId: campaign.id,
        expiresAt,
      },
      select: { token: true },
    });

    return { lead: createdLead, token: createdToken };
  });

  // 3) Envoi email Brevo (token dans l'email, pas dans l'URL)
  const baseUrl = process.env.APP_URL;
  if (!baseUrl) {
    return NextResponse.json({ error: "APP_URL missing in .env" }, { status: 500 });
  }

  const downloadUrl = `${baseUrl}/d/${token.token}`;

  await sendDownloadEmail({
    toEmail: lead.email,
    toName: lead.firstName,
    downloadUrl,
    campaignTitle: campaign.title,
  });

  // 4) Redirection UX
  return NextResponse.redirect(new URL(`/thanks`, req.url));
}