import { MessageFlags, type ChatInputCommandInteraction } from "discord.js";
import type { Config } from "../config.js";
import { hasGameRole, isAdmin } from "../utils.js";
import { handleSeed } from "./seed.js";

export const getInteractionResponse = async (
  interaction: ChatInputCommandInteraction,
  config: Config,
) => {
  if (!interaction.inCachedGuild()) return;

  if (interaction.channelId !== config.CHANNEL_ID) {
    interaction.reply({
      content: "This command can only be used in the configured channel.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const { member } = interaction;

  if (!hasGameRole(member, config) && !isAdmin(member, config)) {
    interaction.reply({
      content: "You do not have the required role to use this command.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  switch (interaction.commandName) {
    case "seed":
      await handleSeed(interaction, config);
      break;
  }
};
