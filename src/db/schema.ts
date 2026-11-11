import { integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: text().primaryKey().notNull(),
  points: integer().default(0),
  strikes: integer().default(0),
  streak: integer().default(0),
});

export const itemsTable = pgTable("items", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().unique().notNull(),
});

// ====== punishments ======

export const punishmentsTable = pgTable("punishments", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull().unique(),
  description: text(),
});

export const punishmentStatusEnum = pgEnum("punishment_status", ["ACTIVE", "COMPLETED"]);

export const punishmentsUsersTable = pgTable("user_punishments", {
  id: uuid().primaryKey().defaultRandom(),
  punishmentId: uuid()
    .notNull()
    .references(() => punishmentsTable.id),
  userId: text()
    .notNull()
    .references(() => usersTable.id),
  assignedAt: timestamp().defaultNow(),
  completedAt: timestamp(),
  status: punishmentStatusEnum(),
});
