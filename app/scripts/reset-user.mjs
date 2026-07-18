// Supprime un compte par e-mail — utilisé par le workflow GitHub Actions
// "Réinitialiser un compte" (bootstrap uniquement, cf. .github/workflows/reset-user.yml).
import { neon } from "@neondatabase/serverless";

const email = (process.env.TARGET_EMAIL ?? "").trim().toLowerCase();
if (!email) {
  console.error("TARGET_EMAIL manquant.");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const rows = await sql`DELETE FROM users WHERE email = ${email} RETURNING email`;

if (rows.length > 0) {
  console.log(`Compte supprimé : ${rows[0].email}`);
} else {
  console.log("Aucun compte trouvé avec cet e-mail.");
}
