import { redirect } from "next/navigation";

/** /tendances (sitemap D10) — même contenu que Découvrir : redirection canonique. */
export default function TendancesPage() {
  redirect("/decouvrir");
}
