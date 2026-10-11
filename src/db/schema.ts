import {
  pgTable,
  text,
  timestamp,
  uuid,
  jsonb,
  integer,
  boolean,
} from "drizzle-orm/pg-core";

// --- Better Auth required tables (shape mandated by @better-auth/drizzle-adapter) ---
// Field names match Better Auth's core schema exactly (see
// @better-auth/core/dist/db/schema/{user,session,account,verification}.d.mts).

export const user = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const account = pgTable("account", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// --- App-specific tables ---

export const caregiverProfiles = pgTable("caregiver_profile", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  // Raw responses for the "personality" + "scenarios" questionnaire blocks.
  responses: jsonb("responses")
    .$type<Record<string, number | string | null>>()
    .notNull()
    .default({}),
  goals: text("goals").array().notNull().default([]),
  completedBlocks: text("completed_blocks").array().notNull().default([]),
  // Cached computeProfile() output, avoids recompute on every page load.
  profileScoresCache: jsonb("profile_scores_cache"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const children = pgTable("child", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  relationshipType: text("relationship_type").notNull(), // RelationshipType union, see src/lib/appState.ts
  relationshipTypeOther: text("relationship_type_other"),
  ageBand: text("age_band").notNull(), // "13-15" | "16-17" | "18-22"
  livingSituation: text("living_situation").notNull(),
  nickname: text("nickname"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const generations = pgTable("generation", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  childId: uuid("child_id").references(() => children.id, { onDelete: "set null" }),
  goal: text("goal").notNull(),
  situationText: text("situation_text").notNull(),
  riskTier: text("risk_tier").notNull(), // green | amber | red
  usedFallback: boolean("used_fallback").notNull().default(false),
  countsTowardUsage: boolean("counts_toward_usage").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usageCounters = pgTable("usage_counter", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  freeGenerationsUsed: integer("free_generations_used").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const subscriptions = pgTable("subscription", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  stripeCustomerId: text("stripe_customer_id").notNull().unique(),
  stripeSubscriptionId: text("stripe_subscription_id"),
  status: text("status").notNull().default("none"), // none | active | past_due | canceled | incomplete
  currentPeriodEnd: timestamp("current_period_end"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
