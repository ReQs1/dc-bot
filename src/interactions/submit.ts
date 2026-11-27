import { EmbedBuilder, MessageFlags, type ChatInputCommandInteraction } from "discord.js";
import { and, eq, ne } from "drizzle-orm";
import { db } from "../db/index.js";
import { itemsTable, usersItemsTable } from "../db/schema.js";
import { getDateString } from "../utils.js";

export const handleSubmit = async (interaction: ChatInputCommandInteraction) => {
  const attachment = interaction.options.getAttachment("daily_image", true);

  const extension = attachment.name.split(".").pop()?.toLowerCase();
  const isPng = extension === "png" && attachment.contentType === "image/png";
  const isJpeg =
    (extension === "jpg" || extension === "jpeg") && attachment.contentType === "image/jpeg";

  if (!isPng && !isJpeg) {
    await interaction.reply({
      content: "Please upload a PNG or JPEG image (.png, .jpg, or .jpeg).",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const today = getDateString(new Date());

  try {
    const [todaysItem] = await db
      .select({
        id: usersItemsTable.id,
        status: usersItemsTable.status,
        name: itemsTable.name,
      })
      .from(usersItemsTable)
      .innerJoin(itemsTable, eq(usersItemsTable.itemId, itemsTable.id))
      .where(
        and(
          eq(usersItemsTable.date, today),
          eq(usersItemsTable.userId, interaction.user.id),
          ne(usersItemsTable.status, "SKIPPED"),
        ),
      )
      .limit(1);

    if (!todaysItem) {
      await interaction.reply({
        content: "You don't have an item for today.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (todaysItem.status === "SUBMITTED") {
      await interaction.reply({
        content: "Your image is still pending approval.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (todaysItem.status === "COMPLETED") {
      await interaction.reply({
        content: "You already completed an item today.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(`Submitted by <@${interaction.user.id}> for ${today}`)
          .addFields({ name: "Item", value: todaysItem.name })
          .setImage(attachment.url),
      ],
      allowedMentions: { parse: [] },
    });

    const message = await interaction.fetchReply();

    await db
      .update(usersItemsTable)
      .set({
        content: attachment.url,
        status: "SUBMITTED",
        messageId: message.id,
        reviewedBy: null,
        cause: null,
      })
      .where(eq(usersItemsTable.id, todaysItem.id));
  } catch (e) {
    console.error(e);
    const errorReply = {
      content: "An error occurred while submitting your image.",
      flags: MessageFlags.Ephemeral,
    } as const;
    if (interaction.replied) {
      await interaction.followUp(errorReply);
    } else {
      await interaction.reply(errorReply);
    }
  }
};
