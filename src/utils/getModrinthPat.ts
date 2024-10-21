import env from "../env";
import { db, schema, eq } from "../drizzle/main";
import type {
  AutocompleteInteraction,
  CommandInteraction,
  ButtonInteraction,
  StringSelectMenuInteraction,
  ModalInteraction,
} from "@buape/carbon";

export async function getModrinthPat(
  interaction:
    | CommandInteraction
    | AutocompleteInteraction
    | ButtonInteraction
    | StringSelectMenuInteraction
    | ModalInteraction,
  autocomplete = false,
) {
  // Get saved user information from database
  const userId = BigInt(interaction.userId as string);
  const user = await db.query.users.findFirst({
    where: eq(schema.users.userId, userId),
  });

  // Cannot find user in database
  if (!user) {
    if (autocomplete) {
      return (interaction as AutocompleteInteraction).respond([
        {
          name: "Error: Missing authorization token",
          value: "null",
        },
      ]);
    }
    return interaction.reply("❌ Missing authorization token. </authorize:1296583363905327114>");
  }

  // Check if authorization token expired
  if (Date.now() > user.modrinthRefreshExpires.getTime()) {
    if (autocomplete) {
      return (interaction as AutocompleteInteraction).respond([
        {
          name: "Error: Modrinth authorization token has expired!",
          value: "null",
        },
      ]);
    }
    return interaction.reply("❌ Modrinth authorization token has expired! </authorize:1296583363905327114>");
  }

  // If refresh token hasn't expired, return user from database
  if (Date.now() > user.modrinthExpires.getTime()) return user.modrinthAuth;

  // Refresh token and return new Modrinth authorization token
  const refreshRequest = await fetch(`${env.MODRINTH_API}/_internal/session/refresh`, {
    method: "post",
    headers: { authorization: user.modrinthAuth },
  });

  if (refreshRequest.status !== 200) {
    return interaction.reply("❌ Failed to refresh Modrinth authorization token! </authorize:1296583363905327114>");
  }

  const { session: newModrinthAuth, expires, refresh_expires } = await refreshRequest.json();

  await db
    .insert(schema.users)
    .values({
      userId,
      modrinthAuth: newModrinthAuth,
      modrinthExpires: new Date(expires),
      modrinthRefreshExpires: new Date(refresh_expires),
    })
    .onDuplicateKeyUpdate({
      set: {
        modrinthAuth: newModrinthAuth,
        modrinthExpires: new Date(expires),
        modrinthRefreshExpires: new Date(refresh_expires),
      },
    });

  return newModrinthAuth;
}
