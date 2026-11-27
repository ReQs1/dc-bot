import type { Config } from "./config.js";
import {
  ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  type GuildMember,
} from "discord.js";
import { itemsTable, usersItemsTable } from "./db/schema.js";
import { db } from "./db/index.js";
import { and, desc, eq } from "drizzle-orm";

export function hasGameRole(member: GuildMember, config: Config): boolean {
  return member.roles.cache.has(config.ROLE_ID);
}

export function isAdmin(member: GuildMember, config: Config): boolean {
  return (
    member.permissions.has(PermissionFlagsBits.Administrator) ||
    member.roles.cache.has(config.ADMIN_ROLE_ID)
  );
}

export function gameGuard(interaction: ChatInputCommandInteraction, config: Config) {
  if (!interaction.inCachedGuild()) return false;

  if (interaction.channelId !== config.CHANNEL_ID) {
    interaction.reply({
      content: "This command can only be used in the configured channel.",
      flags: MessageFlags.Ephemeral,
    });
    return false;
  }

  const { member } = interaction;

  if (!hasGameRole(member, config) && !isAdmin(member, config)) {
    interaction.reply({
      content: "You do not have the required role to use this command.",
      flags: MessageFlags.Ephemeral,
    });
    return false;
  }

  return true;
}

export function getDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export type Item = typeof itemsTable.$inferSelect;

// Rolls a new item, excluding the last 3 COMPLETED items and any items already assigned today (e.g. skipped)
export async function rollNewItem(
  userId: string,
  allItems: Item[],
  today: string,
): Promise<Item | null> {
  const [recentCompleted, todaysItems] = await Promise.all([
    db
      .select({ itemId: usersItemsTable.itemId })
      .from(usersItemsTable)
      .where(and(eq(usersItemsTable.userId, userId), eq(usersItemsTable.status, "COMPLETED")))
      .orderBy(desc(usersItemsTable.date))
      .limit(3),
    db
      .select({ itemId: usersItemsTable.itemId })
      .from(usersItemsTable)
      .where(and(eq(usersItemsTable.userId, userId), eq(usersItemsTable.date, today))),
  ]);

  const excludedIds = new Set([
    ...recentCompleted.map((i) => i.itemId),
    ...todaysItems.map((i) => i.itemId),
  ]);

  const pool = allItems.filter((i) => !excludedIds.has(i.id));
  if (pool.length === 0) return null;

  const item = pool[Math.floor(Math.random() * pool.length)]!;

  await db.insert(usersItemsTable).values({
    userId,
    itemId: item.id,
    status: "PENDING",
    date: today,
  });

  return item;
}
