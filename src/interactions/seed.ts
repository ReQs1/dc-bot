import { MessageFlags, type ChatInputCommandInteraction } from "discord.js";
import type { Config } from "../config.js";
import { isAdmin } from "../utils.js";
import { db } from "../db/index.js";
import { itemsTable, punishmentsTable } from "../db/schema.js";

export const handleSeed = async (interaction: ChatInputCommandInteraction, config: Config) => {
  if (!interaction.inCachedGuild()) return;

  if (!isAdmin(interaction.member, config)) {
    interaction.reply({
      content: "You do not have the required role to use this command.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const attachment = interaction.options.getAttachment("seed_file", true);

  if (!attachment.name.endsWith(".txt") || !attachment.contentType?.startsWith("text/plain")) {
    interaction.reply({
      content: "Seed file must be a text file.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const type = interaction.options.getString("type", true) as "items" | "punishments";

  try {
    const res = await fetch(attachment.url);
    const text = await res.text();
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      await interaction.reply({
        content: "No lines found in the seed file.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (type === "items") {
      const values = lines.map((name) => ({ name }));
      await db.insert(itemsTable).values(values);
    } else {
      const values = lines
        .map((line) => {
          const [name, description] = line.split("|").map((w) => w.trim());
          return { name, description: description ?? null };
        })
        .filter(
          (v): v is { name: string; description: string | null } =>
            typeof v.name === "string" && v.name.length > 0,
        );

      await db.insert(punishmentsTable).values(values);
    }

    await interaction.reply({
      content: `Successfully seeded **${lines.length}** ${type}!`,
      flags: MessageFlags.Ephemeral,
    });
  } catch (e) {
    console.error(e);
    await interaction.reply({
      content: "Something went wrong. Please try again later.",
      flags: MessageFlags.Ephemeral,
    });
  }
};
