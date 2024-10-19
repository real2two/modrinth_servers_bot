import env from "../env";
import {
  ApplicationCommandOptionType,
  Command,
  type APIApplicationCommandBasicOption,
  type CommandInteraction,
} from "@buape/carbon";
import { db, schema } from "../drizzle/main";

export class AuthorizeCommand extends Command {
  name = "authorize";
  description = "Enter your personal access token from Modrinth to this Discord bot";
  defer = false;
  options: APIApplicationCommandBasicOption[] = [
    {
      type: ApplicationCommandOptionType.String,
      name: "pat",
      description: "Enter your personal access token with the 'Read user data' scope here",
      required: true,
    },
  ];

  async run(interaction: CommandInteraction) {
    const modrinthPat = (interaction.options.getString("pat") as string).trim();

    const userRequest = await fetch(`${env.MODRINTH_API}/user`, {
      headers: { authorization: modrinthPat },
    });

    if (userRequest.status !== 200) {
      return interaction.reply(
        "🛑 Could not validate access token!\n-# Make sure your personal access token has the `Read user data` scope.",
        { ephemeral: true },
      );
    }

    await db
      .insert(schema.users)
      .values({
        userId: BigInt(interaction.userId as string),
        modrinthPat,
      })
      .onDuplicateKeyUpdate({ set: { modrinthPat } });

    return interaction.reply("✅ Successfully saved your access token!", { ephemeral: true });
  }
}
