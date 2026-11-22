import cron from "node-cron";
import type { Client } from "discord.js";
import { and, desc, eq, sql } from "drizzle-orm";
import type { Config } from "./config.js";
import { db } from "./db/index.js";
import {
  itemsTable,
  punishmentsTable,
  punishmentsUsersTable,
  usersItemsTable,
  usersTable,
} from "./db/schema.js";
import { getDateString } from "./utils.js";

const STRIKE_THRESHOLD = 3;
const TIMEZONE = "Europe/Warsaw";

export function startCron(client: Client, config: Config) {
  cron.schedule(
    "0 0 * * *",
    async () => {
      const guild = client.guilds.cache.get(config.GUILD_ID);
      if (!guild) {
        console.error("[cron] Guild not found.");
        return;
      }

      await guild.members.fetch();

      const players = guild.members.cache.filter(
        (m) => m.roles.cache.has(config.ROLE_ID) && !m.user.bot,
      );

      const channel = guild.channels.cache.get(config.CHANNEL_ID);
      if (!channel?.isTextBased()) {
        console.error("[cron] Channel not found or not text-based.");
        return;
      }

      await db
        .insert(usersTable)
        .values(players.map((m) => ({ id: m.id })))
        .onConflictDoNothing();

      // PHASE 1 — yesterday's items
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = getDateString(yesterday);

      const failures = await db
        .select()
        .from(usersItemsTable)
        .where(
          and(
            eq(usersItemsTable.date, yesterdayStr),
            sql`${usersItemsTable.status} IN ('PENDING', 'REJECTED')`,
          ),
        );

      const allPunishments = await db.select().from(punishmentsTable);
      const phase1Messages: string[] = [];

      for (const row of failures) {
        await db
          .update(usersTable)
          .set({ strikes: sql`${usersTable.strikes} + 1` })
          .where(eq(usersTable.id, row.userId));

        const [user] = await db.select().from(usersTable).where(eq(usersTable.id, row.userId));

        const strikes = user!.strikes ?? 0;
        const reason = row.status === "REJECTED" ? "rejected submission" : "never submitted";

        phase1Messages.push(
          `<@${row.userId}> failed (${reason}) — ${strikes} strike${strikes !== 1 ? "s" : ""}`,
        );

        if (strikes % STRIKE_THRESHOLD === 0) {
          if (allPunishments.length === 0) {
            console.error("[cron] No punishments in DB — skipping punishment assignment.");
            continue;
          }

          const punishment = allPunishments[Math.floor(Math.random() * allPunishments.length)]!;

          await db.insert(punishmentsUsersTable).values({
            userId: row.userId,
            punishmentId: punishment.id,
            status: "ACTIVE",
            strikeNumber: strikes,
          });

          phase1Messages.push(
            `<@${row.userId}> reached ${strikes} strikes — punishment assigned: **${punishment.name}**${
              punishment.description ? `\n> ${punishment.description}` : ""
            }`,
          );
        }
      }

      if (phase1Messages.length > 0) {
        await channel.send(phase1Messages.join("\n"));
      }

      // PHASE 2 — Roll new items for the day
      const today = getDateString(new Date());
      const allItems = await db.select().from(itemsTable);

      if (allItems.length === 0) {
        console.error("[cron] No items in DB — skipping roll.");
        return;
      }

      const rollMessages: string[] = [`**New items for ${today}:**`];

      for (const [, member] of players) {
        const seenIds = new Set(
          (
            await db
              .select({ itemId: usersItemsTable.itemId })
              .from(usersItemsTable)
              .where(
                and(eq(usersItemsTable.userId, member.id), eq(usersItemsTable.status, "COMPLETED")),
              )
              .orderBy(desc(usersItemsTable.date))
              .limit(3)
          ).map((i) => i.itemId),
        );

        let item: (typeof allItems)[number];
        do {
          item = allItems[Math.floor(Math.random() * allItems.length)]!;
        } while (seenIds.has(item.id));

        await db.insert(usersItemsTable).values({
          userId: member.id,
          itemId: item.id,
          status: "PENDING",
          date: today,
        });

        rollMessages.push(`<@${member.id}> -> **${item.name}**`);
      }

      await channel.send(rollMessages.join("\n"));
    },
    { timezone: TIMEZONE },
  );
}
