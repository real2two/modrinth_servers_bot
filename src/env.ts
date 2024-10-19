export default {
  PORT: Number(process.env.PORT),

  BASE_URL: process.env.BASE_URL as string,

  DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID as string,
  DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET as string,
  DISCORD_PUBLIC_KEY: process.env.DISCORD_PUBLIC_KEY as string,
  DISCORD_TOKEN: process.env.DISCORD_TOKEN as string,

  MODRINTH_API: process.env.MODRINTH_API as string,
  PYRO_ARCHON_API: process.env.PYRO_ARCHON_API as string,

  DATABASE_HOST: process.env.DATABASE_HOST as string,
  DATABASE_PORT: Number(process.env.DATABASE_PORT),
  DATABASE_USER: process.env.DATABASE_USER as string,
  DATABASE_PASSWORD: process.env.DATABASE_PASSWORD as string,
  DATABASE_NAME: process.env.DATABASE_NAME as string,
};
