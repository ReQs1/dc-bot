import { MessageFlags, type ChatInputCommandInteraction } from "discord.js";
import { db } from "../db/index.js";
import { usersItemsTable } from "../db/schema.js";
import { and, eq } from "drizzle-orm";
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
    const existing = await db
      .select({ id: usersItemsTable.id, status: usersItemsTable.status })
      .from(usersItemsTable)
      .where(and(eq(usersItemsTable.date, today), eq(usersItemsTable.userId, interaction.user.id)));

    if (existing.length <= 0) {
      await interaction.reply({
        content: "You don't have an item for today.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const todaysItem = existing[0]!;

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

    await db
      .update(usersItemsTable)
      .set({
        content: attachment.url,
        status: "SUBMITTED",
      })
      .where(and(eq(usersItemsTable.date, today), eq(usersItemsTable.userId, interaction.user.id)));

    await interaction.reply({
      content: "Your image has been submitted!",
      flags: MessageFlags.Ephemeral,
    });
  } catch (e) {
    console.error(e);
    await interaction.reply({
      content: "An error occurred while submitting your image.",
      flags: MessageFlags.Ephemeral,
    });
  }
};
