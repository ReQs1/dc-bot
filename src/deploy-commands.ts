import { REST, Routes, SlashCommandBuilder } from "discord.js";
import { getConfig } from "./config.js";

const config = getConfig();

const globalCommands: SlashCommandBuilder[] = [];

const guildCommands = [
  new SlashCommandBuilder().setName("meow").setDescription("Replies with Meow!"),
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
