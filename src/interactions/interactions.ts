import { type ChatInputCommandInteraction } from "discord.js";
import type { Config } from "../config.js";
import { handleSeed } from "./seed.js";
import { handleSubmit } from "./submit.js";

export const getInteractionResponse = async (
  interaction: ChatInputCommandInteraction,
  config: Config,
) => {
  switch (interaction.commandName) {
    case "seed":
      await handleSeed(interaction, config);
      break;
    case "submit":
      await handleSubmit(interaction);
      break;
  }
};
