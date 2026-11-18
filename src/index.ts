import { Client, Events, GatewayIntentBits } from "discord.js";
import { getConfig } from "./config.js";
import { startCron } from "./cron.js";
import { getInteractionResponse } from "./interactions/interactions.js";
import { gameGuard } from "./utils.js";

const config = getConfig();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

client.on(Events.ClientReady, (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}!`);
  startCron(readyClient, config);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (!gameGuard(interaction, config)) return;

  getInteractionResponse(interaction, config);
});

client.login(config.DISCORD_TOKEN);
