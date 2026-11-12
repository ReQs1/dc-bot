import type { Config } from "./config.js";
import {
  ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  type GuildMember,
} from "discord.js";

export function hasGameRole(member: GuildMember, config: Config): boolean {
  return member.roles.cache.has(config.ROLE_ID);
}

export function isAdmin(member: GuildMember, config: Config): boolean {
  return (
    member.permissions.has(PermissionFlagsBits.Administrator) ||
    member.roles.cache.has(config.ADMIN_ROLE_ID)
  );
}

export function gameGuard(interaction: ChatInputCommandInteraction, config: Config) {
  if (!interaction.inCachedGuild()) return false;

  if (interaction.channelId !== config.CHANNEL_ID) {
    interaction.reply({
      content: "This command can only be used in the configured channel.",
      flags: MessageFlags.Ephemeral,
    });
    return false;
  }

  const { member } = interaction;

  if (!hasGameRole(member, config) && !isAdmin(member, config)) {
    interaction.reply({
      content: "You do not have the required role to use this command.",
      flags: MessageFlags.Ephemeral,
    });
    return false;
  }

  return true;
}
