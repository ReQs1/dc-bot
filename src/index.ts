// Require the necessary discord.js classes
import { Client, Events, GatewayIntentBits } from "discord.js";
import { getConfig } from "./config.js";
import { getInteractionResponse } from "./interactions/interactions.js";

const config = getConfig();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

client.on(Events.ClientReady, (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}!`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  getInteractionResponse(interaction, config);
});

client.login(config.DISCORD_TOKEN);
