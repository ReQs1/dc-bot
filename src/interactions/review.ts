import { MessageFlags, type ChatInputCommandInteraction } from "discord.js";
import { and, eq } from "drizzle-orm";
import type { Config } from "../config.js";
import { db } from "../db/index.js";
import { usersItemsTable } from "../db/schema.js";
import { getDateString, isAdmin } from "../utils.js";

export const handleReview = async (
  interaction: ChatInputCommandInteraction,
  config: Config,
  status: "COMPLETED" | "REJECTED",
) => {
  if (!interaction.inCachedGuild()) return;

  if (!isAdmin(interaction.member, config)) {
    await interaction.reply({
      content: "You do not have the required role to use this command.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const user = interaction.options.getUser("user", true);
  const cause = status === "REJECTED" ? interaction.options.getString("cause", true) : null;
  const today = getDateString(new Date());

  await interaction.deferReply();

  try {
    const [todaysItem] = await db
      .select()
      .from(usersItemsTable)
      .where(and(eq(usersItemsTable.date, today), eq(usersItemsTable.userId, user.id)))
      .limit(1);

    if (!todaysItem) {
      await interaction.editReply("This user doesn't have an item for today.");
      return;
    }

    if (todaysItem.status !== "SUBMITTED" || !todaysItem.messageId) {
      await interaction.editReply("This user doesn't have a submission pending approval today.");
      return;
    }

    const channel = await interaction.guild.channels.fetch(config.CHANNEL_ID);
    if (!channel?.isTextBased()) {
      await interaction.editReply("The submission channel is unavailable.");
      return;
    }

    const message = await channel.messages.fetch(todaysItem.messageId);

    const updated = await db
      .update(usersItemsTable)
      .set({ status, reviewedBy: interaction.user.id, cause })
      .where(
        and(
          eq(usersItemsTable.id, todaysItem.id),
          eq(usersItemsTable.status, "SUBMITTED"),
          eq(usersItemsTable.messageId, todaysItem.messageId),
        ),
      )
      .returning({ id: usersItemsTable.id });

    if (updated.length === 0) {
      await interaction.editReply("This submission has already been reviewed or changed.");
      return;
    }

    const result = status === "COMPLETED" ? "approved" : "rejected";
    const response = `Today's submission for <@${user.id}> was ${result}.${cause ? `\nCause: ${cause}` : ""}`;
    const allowedMentions = { parse: [], users: [user.id] };

    try {
      await message.react(status === "COMPLETED" ? "✅" : "❌");
    } catch (e) {
      console.error(e);
      await interaction.editReply({
        content: `${response}\nThe reaction could not be added. Check the bot's message and reaction permissions.`,
        allowedMentions,
      });
      return;
    }

    await interaction.editReply({ content: response, allowedMentions });
  } catch (e) {
    console.error(e);
    await interaction.editReply("An error occurred while reviewing the submission.");
  }
};
