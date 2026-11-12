import { REST, Routes, SlashCommandBuilder } from "discord.js";
import { getConfig } from "./config.js";

const config = getConfig();

const globalCommands: SlashCommandBuilder[] = [];

const guildCommands = [
  new SlashCommandBuilder()
    .setName("seed")
    .setDescription("Seeds the bot with either items or punishments")
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("The type of seed to use")
        .setRequired(true)
        .addChoices([
          { name: "items", value: "items" },
          { name: "punishments", value: "punishments" },
        ]),
    )
    .addAttachmentOption((option) =>
      option
        .setName("seed_file")
        .setDescription(
          "Txt file to seed DB. Must be a txt file with each item/punishement written in new line",
        )
        .setRequired(true),
    ),
];

const rest = new REST({ version: "10" }).setToken(config.DISCORD_TOKEN);

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(Routes.applicationGuildCommands(config.CLIENT_ID, config.GUILD_ID), {
      body: guildCommands,
    });

    await rest.put(Routes.applicationCommands(config.CLIENT_ID), {
      body: globalCommands,
    });

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();
