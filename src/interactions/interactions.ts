import { type ChatInputCommandInteraction } from "discord.js";
import type { Config } from "../config.js";
import { handleSeed } from "./seed.js";

export const getInteractionResponse = async (
  interaction: ChatInputCommandInteraction,
  config: Config,
) => {
  switch (interaction.commandName) {
    case "seed":
      await handleSeed(interaction, config);
      break;
  }
};
