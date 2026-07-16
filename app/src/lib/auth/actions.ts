"use server";

import { AuthError } from "next-auth";
import { hash } from "@node-rs/argon2";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { clientIp, limit, RATE_LIMITED_MESSAGE } from "@/lib/rate-limit";
import { isAuthConfigured, isBootstrapAdmin, signIn, signOut } from "./config";

/**
 * Actions d'authentification (6.1 Lot 2) — progressive enhancement :
 * les formulaires fonctionnent sans JS (POST natif des server actions).
 * Anti-abus v1 : honeypot `website` (D13) ; rate limiting en base au Lot 4.
 */

export interface AuthFormState {
  error?: string;
}

const registerSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Adresse e-mail invalide.")),
  password: z.string().min(8, "8 caractères minimum.").max(128, "128 caractères maximum."),
  displayName: z.string().trim().max(60, "60 caractères maximum.").optional(),
  website: z.literal("").optional(), // honeypot — un bot qui le remplit est rejeté
});

export async function registerAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  if (!isAuthConfigured()) return { error: "Les comptes ne sont pas encore ouverts." };
  if (!(await limit("auth.register", await clientIp(), 5, 3600))) return { error: RATE_LIMITED_MESSAGE };

  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    displayName: formData.get("displayName") || undefined,
    website: formData.get("website") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }
  const { email, password, displayName } = parsed.data;

  try {
    const passwordHash = await hash(password);
    await db()
      .insert(schema.users)
      .values({
        email,
        passwordHash,
        displayName: displayName ?? null,
        role: isBootstrapAdmin(email) ? "admin" : "user",
      });
  } catch {
    // Violation d'unicité ou base indisponible — message neutre (pas d'énumération d'adresses).
    return { error: "Impossible de créer un compte avec cette adresse." };
  }

  await signIn("credentials", { email, password, redirectTo: "/ma-liste" });
  return {};
}

export async function loginAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  if (!isAuthConfigured()) return { error: "Les comptes ne sont pas encore ouverts." };
  if (formData.get("website")) return { error: "Formulaire invalide." };
  if (!(await limit("auth.login", await clientIp(), 10, 900))) return { error: RATE_LIMITED_MESSAGE };

  try {
    await signIn("credentials", {
      email: String(formData.get("email") ?? "").trim().toLowerCase(),
      password: String(formData.get("password") ?? ""),
      redirectTo: "/ma-liste",
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Identifiants invalides." };
    }
    throw error; // NEXT_REDIRECT (succès) et erreurs inattendues remontent
  }
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/" });
}
