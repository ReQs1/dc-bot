import { MessageFlags, type ChatInputCommandInteraction } from "discord.js";
import type { Config } from "../config.js";
import { hasGameRole } from "../utils.js";

export const getInteractionResponse = (
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

  if (!hasGameRole(member, config)) {
    interaction.reply({
      content: "You do not have the required role to use this command.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  switch (interaction.commandName) {
    case "meow":
      interaction.reply("Meow!");
      break;
  }
};
