import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * Audits d'accessibilité automatisés (D1 a11y, D26) — axe-core sur les pages
 * clés, niveau WCAG 2.1 AA. Bloquant : toute violation fait échouer la suite.
 * (L'audit automatique couvre ~30-40 % de WCAG : les parcours clavier/lecteur
 * d'écran restent au plan de tests manuel.)
 */

const PAGES = [
  { path: "/", name: "Accueil" },
  { path: "/gratuit", name: "Gratuit" },
  { path: "/regarder/big-buck-bunny", name: "Watch" },
  { path: "/ma-liste", name: "Ma liste" },
  { path: "/recherche", name: "Recherche" },
  { path: "/faq", name: "FAQ" },
  { path: "/contact", name: "Contact" },
  { path: "/cgu", name: "CGU" },
  { path: "/studio", name: "Studio" },
  { path: "/connexion", name: "Connexion" },
];

for (const { path, name } of PAGES) {
  test(`axe WCAG 2.1 AA — ${name} (${path})`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(
      results.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => n.target.join(" ")).slice(0, 5),
      })),
    ).toEqual([]);
  });
}
