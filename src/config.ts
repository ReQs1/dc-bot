import "dotenv/config";

export const getConfig = () => {
  if (!process.env.DISCORD_TOKEN) {
    throw new Error("DISCORD_TOKEN not set");
  }

  if (!process.env.CLIENT_ID) {
    throw new Error("CLIENT_ID not set");
  }

  if (!process.env.GUILD_ID) {
    throw new Error("GUILD_ID not set");
  }

  if (!process.env.CHANNEL_ID) {
    throw new Error("CHANNEL_ID not set");
  }

  if (!process.env.ROLE_ID) {
    throw new Error("ROLE_ID not set");
  }

  if (!process.env.ADMIN_ROLE_ID) {
    throw new Error("ADMIN_ROLE_ID not set");
  }

  if (!process.env.DB_FILE_NAME) {
    throw new Error("DB_FILE_NAME not set");
  }

  return {
    DISCORD_TOKEN: process.env.DISCORD_TOKEN,
    CLIENT_ID: process.env.CLIENT_ID,
    GUILD_ID: process.env.GUILD_ID,
    CHANNEL_ID: process.env.CHANNEL_ID,
    ROLE_ID: process.env.ROLE_ID,
    ADMIN_ROLE_ID: process.env.ADMIN_ROLE_ID,
    DB_FILE_NAME: process.env.DB_FILE_NAME,
  };
};

export type Config = ReturnType<typeof getConfig>;
