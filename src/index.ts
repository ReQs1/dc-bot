// Require the necessary discord.js classes
import { Client, Events, GatewayIntentBits } from "discord.js";
import { getConfig } from "./config.js";
import { getInteractionResponse } from "./interactions/interactions.js";
import { gameGuard } from "./utils.js";

const config = getConfig();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

client.on(Events.ClientReady, (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}!`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  // goes here to type narrow the interaction to a ChatInputCommandInteraction
  if (!interaction.isChatInputCommand()) return;

  if (!gameGuard(interaction, config)) return;

  getInteractionResponse(interaction, config);
});

client.login(config.DISCORD_TOKEN);
