import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users", {
  id: text().primaryKey().notNull(),
  points: integer().default(0),
  strikes: integer().default(0),
  skips: integer().default(2),
});

// ====== items ======

export const itemsTable = sqliteTable("items", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().unique().notNull(),
});

export const usersItemsStatusEnum = ["PENDING", "ACCEPTED", "REJECTED", "SKIPPED"] as const;

export const usersItemsTable = sqliteTable("user_items", {
  id: integer().primaryKey({ autoIncrement: true }),
  userId: text()
    .notNull()
    .references(() => usersTable.id),
  itemId: integer()
    .notNull()
    .references(() => itemsTable.id),
  status: text({ enum: usersItemsStatusEnum }).default("PENDING").notNull(),
  content: text(), // ← photo URL from /submit,
  reviewedBy: text(), // ← Admin Discord ID
  date: text()
    .$defaultFn(() => new Date().toISOString().slice(0, 10))
    .notNull(),
});

// ====== punishments ======

export const punishmentsTable = sqliteTable("punishments", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
  description: text(),
});

export const punishmentStatusEnum = ["ACTIVE", "COMPLETED"] as const;

export const punishmentsUsersTable = sqliteTable("user_punishments", {
  id: integer().primaryKey({ autoIncrement: true }),
  punishmentId: integer()
    .notNull()
    .references(() => punishmentsTable.id),
  userId: text()
    .notNull()
    .references(() => usersTable.id),
  status: text({ enum: punishmentStatusEnum }).notNull(),
  strikeNumber: integer().notNull(),
  assignedAt: integer({ mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  completedAt: integer({ mode: "timestamp" }),
});
