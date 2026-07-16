"use server";

import { z } from "zod";
import { db, isDbConfigured, schema } from "@/lib/db";

/**
 * Formulaire de contact (levée H77, 6.1 Lot 2) — enregistré en base,
 * traité depuis le back-office (7.1). Honeypot `website` (D13) ;
 * champs takedown structurés pour le motif ayants droit (D11).
 */

export interface ContactFormState {
  ok?: boolean;
  error?: string;
}

const contactSchema = z.object({
  motif: z.enum([
    "Question",
    "Bug",
    "Signaler un contenu",
    "Ayants droit / demande de retrait",
    "Annonceurs",
    "Autre",
  ]),
  email: z.string().trim().toLowerCase().pipe(z.email("Adresse e-mail invalide.")),
  message: z.string().trim().min(10, "Message trop court (10 caractères minimum).").max(5000),
  takedownUrl: z.string().trim().max(500).optional(),
  takedownRole: z.string().trim().max(200).optional(),
  website: z.literal("").optional(), // honeypot
});

export async function submitContactAction(_prev: ContactFormState, formData: FormData): Promise<ContactFormState> {
  if (!isDbConfigured()) {
    return { error: "L'envoi n'est pas encore actif — réessayez très bientôt." };
  }

  const parsed = contactSchema.safeParse({
    motif: formData.get("motif"),
    email: formData.get("email"),
    message: formData.get("message"),
    takedownUrl: formData.get("takedownUrl") || undefined,
    takedownRole: formData.get("takedownRole") || undefined,
    website: formData.get("website") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }
  const { motif, email, message, takedownUrl, takedownRole } = parsed.data;

  try {
    await db()
      .insert(schema.contactMessages)
      .values({
        motif,
        email,
        message,
        takedown:
          motif === "Ayants droit / demande de retrait"
            ? { url: takedownUrl ?? "", role: takedownRole ?? "", declaredAt: new Date().toISOString() }
            : null,
      });
  } catch (error) {
    console.error("[contact] enregistrement impossible :", error);
    return { error: "Une erreur est survenue — merci de réessayer." };
  }

  return { ok: true };
}
