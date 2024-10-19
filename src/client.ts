import env from "./env";
import commands from "./commands";
import { Client } from "@buape/carbon";

export const client = new Client(
  {
    baseUrl: env.BASE_URL,
    clientId: env.DISCORD_CLIENT_ID,
    clientSecret: env.DISCORD_CLIENT_SECRET,
    publicKey: env.DISCORD_PUBLIC_KEY,
    token: env.DISCORD_TOKEN,
    deploySecret: "",
    disableDeployRoute: true,
  },
  // @ts-ignore Blame Carbon.
  commands,
);
