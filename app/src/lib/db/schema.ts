import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * Schéma v1 (6.0 §2) — la base fait foi dès qu'un utilisateur est connecté ;
 * le store local du navigateur reste la vérité des visiteurs anonymes (H70).
 * Migrations générées par drizzle-kit, versionnées dans `drizzle/`.
 */

// ── Comptes (Auth.js v5 au Lot 2 — adaptateur Drizzle) ─────────────────────────

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
  /** Hash argon2 — null pour les comptes magic-link/OAuth purs. */
  passwordHash: text("password_hash"),
  displayName: text("display_name"),
  role: userRoleEnum("role").notNull().default("user"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Ma liste (contrat du store front H70 : favorites / resume / history) ──────

export const listKindEnum = pgEnum("list_kind", ["favorites", "resume", "history"]);
export const titleKindEnum = pgEnum("title_kind", ["film", "serie", "video"]);

export const listEntries = pgTable(
  "list_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    list: listKindEnum("list").notNull(),
    titleKind: titleKindEnum("title_kind").notNull(),
    titleId: integer("title_id").notNull(),
    /** Instantané d'affichage (titre, année, affiche, href) — évite un aller TMDB par carte. */
    snapshot: jsonb("snapshot").notNull(),
    progress: real("progress"),
    positionSeconds: integer("position_seconds"),
    addedAt: timestamp("added_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("list_entries_unique").on(t.userId, t.list, t.titleKind, t.titleId),
    index("list_entries_user_list_idx").on(t.userId, t.list, t.addedAt),
  ],
);

// ── Vidéos (catalogue ingéré D8 + UGC D11) ────────────────────────────────────

export const videoStatusEnum = pgEnum("video_status", [
  "draft",
  "uploading",
  "processing",
  "pending_review",
  "published",
  "rejected",
  "removed",
]);

export const videos = pgTable(
  "videos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("owner_id").references(() => users.id, { onDelete: "set null" }),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    year: integer("year"),
    overview: text("overview").notNull().default(""),
    durationSeconds: integer("duration_seconds"),
    /** Déclaration de droits obligatoire à l'upload (D11). */
    licence: text("licence").notNull(),
    rightsDeclaration: text("rights_declaration").notNull(),
    attribution: text("attribution").notNull().default(""),
    status: videoStatusEnum("status").notNull().default("draft"),
    /** Clés R2 (source + manifeste HLS) — remplies par le pipeline D7. */
    sourceKey: text("source_key"),
    hlsManifestKey: text("hls_manifest_key"),
    posterKey: text("poster_key"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
  },
  (t) => [index("videos_status_idx").on(t.status, t.createdAt)],
);

export const moderationEvents = pgTable(
  "moderation_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    videoId: uuid("video_id")
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),
    moderatorId: uuid("moderator_id").references(() => users.id, { onDelete: "set null" }),
    action: text("action").notNull(), // approve | reject | remove | takedown
    reason: text("reason").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("moderation_events_video_idx").on(t.videoId, t.createdAt)],
);

// ── Config runtime (D6 : effet immédiat sans redéploiement) ───────────────────

export const appConfig = pgTable("app_config", {
  key: text("key").primaryKey(), // ex. ads.enabled, ads.display.home, ugc.upload.enabled
  value: boolean("value").notNull(),
  updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Contact & takedown (D11, activation des formulaires H77) ─────────────────

export const contactMessages = pgTable(
  "contact_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    motif: text("motif").notNull(),
    email: text("email").notNull(),
    message: text("message").notNull(),
    /** Champs enrichis takedown (D11) : URL visée, qualité du demandeur, déclaration. */
    takedown: jsonb("takedown"),
    status: text("status").notNull().default("new"), // new | in_progress | closed
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("contact_messages_status_idx").on(t.status, t.createdAt)],
);
