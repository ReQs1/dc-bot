import type { Config } from "./config.js";
import { PermissionFlagsBits, type GuildMember } from "discord.js";

export function hasGameRole(member: GuildMember, config: Config): boolean {
  return member.roles.cache.has(config.ROLE_ID);
}

export function isAdmin(member: GuildMember, config: Config): boolean {
  return (
    member.permissions.has(PermissionFlagsBits.Administrator) ||
    member.roles.cache.has(config.ADMIN_ROLE_ID)
  );
}
