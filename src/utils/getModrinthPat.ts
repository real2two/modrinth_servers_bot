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
  const user = await db.query.users.findFirst({
    where: eq(schema.users.userId, BigInt(interaction.userId as string)),
  });

  if (!user) {
    if (autocomplete) return (interaction as AutocompleteInteraction).respond([]);
    return interaction.reply("❌ Missing access token.", { ephemeral: true });
  }

  return user.modrinthPat;
}
