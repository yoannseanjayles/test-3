import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez l'équipe Ciné+ : question, bug, signalement de contenu, ayants droit, annonceurs.",
};

/**
 * Contact (D19 Support §2) — formulaire 4 champs avec motifs, dont la procédure
 * notice & takedown (D11) et l'entrée annonceurs (kit média en Phase 8).
 * H77 : l'envoi s'active avec le back-end (6.1) — champs visibles et remplissables
 * pour valider le parcours, soumission explicitement désactivée (jamais de faux succès).
 */

const MOTIFS = [
  "Question",
  "Bug",
  "Signaler un contenu",
  "Ayants droit / demande de retrait",
  "Annonceurs",
  "Autre",
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-10 md:px-6">
      <h1 className="text-3xl font-bold md:text-4xl">Contact</h1>
      <p className="mt-2 text-sm text-secondary">
        Réponse sous 72 h. Pour les questions courantes, la <Link href="/faq" className="text-link hover:text-brand">FAQ</Link> répond immédiatement.
      </p>

      <div className="mt-6 rounded-(--radius-m) border-l-2 border-brand bg-surface-raised px-4 py-3 text-sm leading-relaxed text-secondary">
        L&apos;envoi du formulaire s&apos;active avec notre back-end (mise en service imminente).
        Les demandes de retrait d&apos;ayants droit seront traitées en priorité dès l&apos;ouverture.
      </div>

      <form className="mt-8 space-y-5" aria-describedby="form-status">
        <div>
          <label htmlFor="motif" className="mb-1.5 block text-sm font-medium">
            Motif
          </label>
          <select
            id="motif"
            name="motif"
            className="h-12 w-full rounded-(--radius-m) border border-white/10 bg-surface-raised px-4 text-primary focus:border-brand focus:outline-none"
          >
            {MOTIFS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-primary/50">
            « Ayants droit / demande de retrait » : merci de préciser l&apos;URL du contenu, votre
            qualité (titulaire, mandataire…) et votre déclaration — procédure de retrait prioritaire.
          </p>
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
            Votre e-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="vous@exemple.fr"
            className="h-12 w-full rounded-(--radius-m) border border-white/10 bg-surface-raised px-4 text-primary placeholder:text-primary/40 focus:border-brand focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="message" className="mb-1.5 block text-sm font-medium">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={6}
            placeholder="Décrivez votre demande — pour un bug : la page, l'appareil et ce qui s'est passé."
            className="w-full rounded-(--radius-m) border border-white/10 bg-surface-raised px-4 py-3 text-primary placeholder:text-primary/40 focus:border-brand focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled
          aria-disabled="true"
          title="L'envoi s'active avec le back-end"
          className="inline-flex h-12 items-center rounded-full bg-brand px-7 font-medium text-on-brand opacity-45"
        >
          Envoyer — bientôt actif
        </button>
        <p id="form-status" className="text-xs text-primary/50">
          Annonceurs : un kit média détaillé (audiences, formats plafonnés, brand safety) sera
          disponible avec l&apos;offre publicitaire.
        </p>
      </form>
    </div>
  );
}
