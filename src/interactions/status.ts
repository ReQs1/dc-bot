import { EmbedBuilder, type ChatInputCommandInteraction } from "discord.js";
import { db } from "../db/index.js";
import { itemsTable, usersItemsTable } from "../db/schema.js";
import { and, eq } from "drizzle-orm";
import { getDateString } from "../utils.js";
import { statusColor, statusEmoji } from "../constants/status.constants.js";

export const handleStatus = async (interaction: ChatInputCommandInteraction) => {
  if (!interaction.inCachedGuild()) return;

  await interaction.deferReply();

  const callerId = interaction.user.id;

  const today = getDateString(new Date());

  try {
    const [usersTodayEntry] = await db
      .select({
        status: usersItemsTable.status,
        item: itemsTable.name,
        cause: usersItemsTable.cause,
      })
      .from(usersItemsTable)
      .innerJoin(itemsTable, eq(usersItemsTable.itemId, itemsTable.id))
      .where(and(eq(usersItemsTable.userId, callerId), eq(usersItemsTable.date, today)))
      .limit(1);

    if (!usersTodayEntry) {
      await interaction.editReply("No item found for today.");
      return;
    }

    const status = usersTodayEntry.status;

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(statusColor[status] ?? 0x5865f2)
          .setAuthor({
            name: `${interaction.user.username}'s daily status`,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setTitle("Today's Item")
          .setDescription(`**${usersTodayEntry.item}**`)
          .addFields(
            {
              name: "Status",
              value: `${statusEmoji[status] ?? "ℹ️"} ${status.toLowerCase()}`,
              inline: true,
            },
            ...(status === "REJECTED" && usersTodayEntry.cause
              ? [{ name: "Cause", value: usersTodayEntry.cause }]
              : []),
          ),
      ],
    });
  } catch (error) {
    console.error(error);
    await interaction.editReply("An error occurred while fetching your status.");
  }
};
