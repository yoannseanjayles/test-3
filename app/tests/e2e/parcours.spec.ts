import { expect, test } from "@playwright/test";

/**
 * Parcours critiques (D26 §tests) — exécutés flags par défaut :
 * pub OFF (D6 : « Publicité » absente du DOM), UGC OFF, TMDB non configuré
 * (l'accueil affiche ses contenus de repli — jamais d'erreur, D14 §états).
 */

test.describe("Accueil", () => {
  test("rend le hero, les rails et le skip-link", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Aller au contenu" })).toBeAttached();
    await expect(page.getByRole("region", { name: "À la une" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Tendances cette semaine" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Gratuit ▶" })).toBeVisible();
  });

  test("pub OFF ⇒ aucun libellé « Publicité » dans le DOM (D6/D14)", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Publicité", { exact: true })).toHaveCount(0);
  });
});

test.describe("Catalogue gratuit & lecteur", () => {
  test("l'étagère Gratuit mène à la page de lecture avec écran d'intro", async ({ page }) => {
    await page.goto("/gratuit");
    await page.getByRole("link", { name: /Big Buck Bunny/ }).click();
    await expect(page).toHaveURL(/\/regarder\/big-buck-bunny/);
    await expect(page.getByRole("button", { name: /▶ Regarder/ })).toBeVisible();
    await expect(page.getByText("CC BY 3.0").first()).toBeVisible();
  });

  test("slug inconnu ⇒ vraie 404 illustrée", async ({ page }) => {
    const response = await page.goto("/regarder/nexiste-pas");
    expect(response?.status()).toBe(404);
    await expect(page.getByText("Cette page n'existe pas (ou plus)")).toBeVisible();
  });
});

test.describe("Ma liste", () => {
  test("les 3 onglets s'affichent avec leurs états vides", async ({ page }) => {
    await page.goto("/ma-liste");
    await expect(page.getByRole("tab", { name: "Favoris" })).toBeVisible();
    await expect(page.getByText("Aucun favori pour l'instant")).toBeVisible();
    await page.getByRole("tab", { name: "En cours" }).click();
    await expect(page.getByText("Rien en cours de lecture")).toBeVisible();
    await page.getByRole("tab", { name: "Historique" }).click();
    await expect(page.getByText("Votre historique est vide")).toBeVisible();
  });
});

test.describe("Recherche", () => {
  test("le formulaire fonctionne sans JavaScript (GET)", async ({ page }) => {
    await page.goto("/recherche");
    await page.getByLabel("Titre de film ou de série").fill("matrix");
    await page.getByRole("button", { name: "Rechercher" }).click();
    await expect(page).toHaveURL(/\/recherche\?q=matrix/);
  });
});

test.describe("Support", () => {
  test("la FAQ expose ses questions en accordéons", async ({ page }) => {
    await page.goto("/faq");
    const question = page.getByText("D'où viennent les films gratuits ?");
    await expect(question).toBeVisible();
    await question.click();
    await expect(page.getByText(/domaine public et de licences ouvertes/)).toBeVisible();
  });

  test("le footer ne contient aucun lien mort", async ({ page, request }) => {
    await page.goto("/");
    const hrefs = await page
      .locator("footer a[href^='/']")
      .evaluateAll((links) => links.map((a) => (a as HTMLAnchorElement).getAttribute("href")!));
    expect(hrefs.length).toBeGreaterThanOrEqual(7);
    for (const href of hrefs) {
      const response = await request.get(href);
      expect(response.status(), `lien footer ${href}`).toBe(200);
    }
  });

  test("le studio affiche l'état fermé (UGC OFF, D11)", async ({ page }) => {
    await page.goto("/studio");
    await expect(page.getByText("Le Studio ouvre bientôt")).toBeVisible();
    await expect(page.getByText("Modération avant publication")).toBeVisible();
  });
});
