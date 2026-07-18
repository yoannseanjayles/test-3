import type { Metadata } from "next";
import { isAuthConfigured } from "@/lib/auth/config";
import { ParametresClient } from "./ParametresClient";

export const metadata: Metadata = {
  title: "Mon compte",
  description: "Gérez votre compte Ciné+ : mot de passe, notifications, données personnelles.",
  robots: { index: false },
};

/** Profil/Paramètres utilisateur (spec 2.1, audit B2) — self-service RGPD inclus. */
export default function ParametresPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <h1 className="text-3xl font-bold md:text-4xl">Mon compte</h1>
      <ParametresClient authEnabled={isAuthConfigured()} />
    </div>
  );
}
