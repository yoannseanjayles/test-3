import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Breadcrumb, breadcrumbJsonLd } from "@/components/ui/Breadcrumb";
import { Rail } from "@/components/ui/Rail";
import { TitleCard } from "@/components/ui/TitleCard";
import { parseSlugId, type PersonCreditTitle, type PersonDetails } from "@/lib/tmdb/models";
import { getPersonDetails, isTmdbConfigured } from "@/lib/tmdb/queries";
import { absoluteUrl } from "@/lib/site";

/**
 * Fiche Personne (audit A5, sitemap D10) — URL FR stable `/personne/nom-ID` :
 * seul l'ID fait foi, le libellé n'est que cosmétique. Même gabarit de chargement
 * que les fiches Film/Série : sans clé TMDB ou ID inconnu → notFound (repli honnête).
 */

export const revalidate = 21600;
export async function generateStaticParams() {
  return [];
}

async function load(slug: string) {
  const id = parseSlugId(slug);
  if (!id || !isTmdbConfigured()) return null;
  return getPersonDetails(id);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const details = await load(slug);
  if (!details) return { title: "Personne introuvable" };
  // La biographie TMDB est souvent vide en fr-FR : description générée en repli.
  const description =
    details.biography.trim().slice(0, 160) ||
    `${details.name}${details.department ? ` (${details.department.toLowerCase()})` : ""} : œuvres marquantes et filmographie complète, films et séries.`;
  return {
    title: details.name,
    description,
    alternates: { canonical: details.href },
    openGraph: {
      title: details.name,
      description: description.slice(0, 200),
      images: details.photoUrl ? [details.photoUrl] : undefined,
      type: "profile",
    },
  };
}

/** Date ISO `AAAA-MM-JJ` → « 12 mars 1954 » (fr-FR) ; null si invalide. */
function formatDate(iso: string): string | null {
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeZone: "UTC" }).format(date);
}

/** Coupe la biographie vers 600 caractères (fin de mot) — le reste passe dans un `<details>`. */
function splitBiography(bio: string): { excerpt: string; rest: string | null } {
  const text = bio.trim();
  if (text.length <= 700) return { excerpt: text, rest: null };
  const lastSpace = text.lastIndexOf(" ", 600);
  const cut = lastSpace > 200 ? lastSpace : 600;
  return { excerpt: `${text.slice(0, cut)}…`, rest: text.slice(cut).trim() };
}

/** Sous-section de filmographie : grille locale de cartes avec le rôle en légende, plafonnée à 30. */
function CreditSection({ title, credits }: { title: string; credits: PersonCreditTitle[] }) {
  if (credits.length === 0) return null;
  const shown = credits.slice(0, 30);
  return (
    <section aria-label={title} className="mt-8">
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="mt-0.5 text-sm text-secondary">
        {credits.length > shown.length
          ? `${credits.length} titres — les ${shown.length} plus récents sont affichés.`
          : `${credits.length} titre${credits.length > 1 ? "s" : ""}.`}
      </p>
      <ul className="mt-4 grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-4 md:grid-cols-6">
        {shown.map((t) => (
          <li key={`${t.kind}-${t.id}`} className="[&>a]:w-full">
            <TitleCard
              href={t.href}
              title={t.title}
              year={t.year ?? undefined}
              posterUrl={t.posterUrl}
              caption={t.role || undefined}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

/** JSON-LD Person (schema.org) — champs absents simplement omis. */
function personJsonLd(details: PersonDetails) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: details.name,
    image: details.photoUrl ?? undefined,
    birthDate: details.birthday ?? undefined,
    deathDate: details.deathday ?? undefined,
    jobTitle: details.department || undefined,
    url: absoluteUrl(details.href),
  };
}

export default async function PersonnePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const details = await load(slug);
  if (!details) notFound();

  const born = details.birthday ? formatDate(details.birthday) : null;
  const died = details.deathday ? formatDate(details.deathday) : null;
  const { excerpt, rest } = splitBiography(details.biography);
  const hasFilmography =
    details.knownFor.length > 0 || details.actingCredits.length > 0 || details.crewCredits.length > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd(details)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([{ label: details.name }])) }}
      />

      <Breadcrumb items={[{ label: details.name }]} />

      {/* En-tête : photo 2:3 + nom + métier + repères biographiques */}
      <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:gap-8">
        <div
          className="relative aspect-[2/3] w-36 shrink-0 overflow-hidden rounded-(--radius-m) bg-surface-raised md:w-48"
          aria-hidden={!details.photoUrl}
        >
          {details.photoUrl ? (
            <Image
              src={details.photoUrl}
              alt={`Photo de ${details.name}`}
              fill
              priority
              sizes="(min-width: 768px) 192px, 144px"
              className="object-cover"
            />
          ) : (
            <span className="flex h-full items-center justify-center font-display text-4xl font-bold text-primary/30">
              {details.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="min-w-0 sm:self-end">
          {details.department && (
            <p className="text-sm font-medium uppercase tracking-wide text-brand">{details.department}</p>
          )}
          <h1 className="mt-1 text-3xl font-bold md:text-5xl">{details.name}</h1>
          {(born || died) && (
            <p className="mt-3 text-sm text-secondary">
              {born && (
                <>
                  Né·e le {born}
                  {details.placeOfBirth ? ` à ${details.placeOfBirth}` : ""}
                </>
              )}
              {born && died && " "}
              {died && (
                <span className="whitespace-nowrap">
                  {"("}
                  <span aria-hidden>†</span>
                  <span className="sr-only">décès</span> le {died}
                  {")"}
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Biographie — TMDB renvoie souvent une bio vide en fr-FR : repli honnête. */}
      <section aria-label="Biographie" className="mt-10 max-w-3xl">
        <h2 className="text-xl font-bold">Biographie</h2>
        {excerpt ? (
          <>
            <p className="mt-2 whitespace-pre-line leading-relaxed text-secondary">{excerpt}</p>
            {rest && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-link transition-colors duration-(--duration-fast) hover:text-brand">
                  Lire la suite
                </summary>
                <p className="mt-2 whitespace-pre-line leading-relaxed text-secondary">{rest}</p>
              </details>
            )}
          </>
        ) : (
          <p className="mt-2 text-sm leading-relaxed text-secondary">
            Aucune biographie en français pour le moment.
          </p>
        )}
      </section>

      {/* Œuvres marquantes (top popularité TMDB, toutes casquettes confondues) */}
      {details.knownFor.length > 0 && (
        <Rail title="Connu·e pour">
          {details.knownFor.map((t) => (
            <TitleCard key={`${t.kind}-${t.id}`} href={t.href} title={t.title} year={t.year ?? undefined} posterUrl={t.posterUrl} />
          ))}
        </Rail>
      )}

      {/* Filmographie complète : interprétation puis équipe technique, plafonnées à 30 */}
      {(details.actingCredits.length > 0 || details.crewCredits.length > 0) && (
        <section aria-label="Filmographie" className="mt-12">
          <h2 className="text-2xl font-bold">Filmographie</h2>
          <CreditSection title="Interprétation" credits={details.actingCredits} />
          <CreditSection title="Équipe technique" credits={details.crewCredits} />
        </section>
      )}

      {!hasFilmography && (
        <p className="mt-10 text-sm text-secondary">Aucune filmographie référencée pour le moment.</p>
      )}
    </div>
  );
}
