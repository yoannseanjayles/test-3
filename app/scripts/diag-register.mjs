// Rejoue exactement les étapes de registerAction (hash argon2 + insertion)
// avec un e-mail jetable, pour révéler l'erreur réelle que le formulaire
// masque volontairement (message générique anti-énumération). Nettoie
// toujours sa ligne de test, même en cas d'échec partiel.
import { neon } from "@neondatabase/serverless";

const TEST_EMAIL = "diagnostic-test@cineplus.invalid";
const sql = neon(process.env.DATABASE_URL);

async function cleanup() {
  await sql`DELETE FROM users WHERE email = ${TEST_EMAIL}`;
}

try {
  console.log("1/3 — argon2 hash…");
  const { hash } = await import("@node-rs/argon2");
  const passwordHash = await hash("mot-de-passe-diagnostic-1234");
  console.log("    OK — hash produit (" + passwordHash.length + " caractères)");

  console.log("2/3 — insertion en base…");
  await cleanup();
  const rows = await sql`
    INSERT INTO users (email, password_hash, role)
    VALUES (${TEST_EMAIL}, ${passwordHash}, 'user')
    RETURNING id, email, role
  `;
  console.log("    OK — ligne insérée :", JSON.stringify(rows[0]));

  console.log("3/3 — nettoyage…");
  await cleanup();
  console.log("    OK — ligne de test supprimée");

  console.log("\n✅ Le chemin complet (hash + insertion) fonctionne sans erreur.");
} catch (error) {
  console.error("\n❌ ERREUR RÉELLE :");
  console.error(error);
  await cleanup().catch(() => {});
  process.exit(1);
}
