import env from "../env";
import {
  ApplicationCommandOptionType,
  Command,
  Embed,
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
      required: false,
    },
  ];

  async run(interaction: CommandInteraction) {
    const modrinthPat = interaction.options.getString("pat")?.trim();

    if (!modrinthPat) {
      return interaction.reply(
        {
          embeds: [
            new Embed({
              color: 0xfee75c,
              title: "How to authorize your Modrinth account to this Discord bot",
              description: '1. Go to https://redacted.modrinth.com/settings/pats\n2. Click "Create a PAT".',
              image: { url: "https://media.discordapp.net/attachments/1297352938250965023/1297352975265828874/image.png" },
            }),
            new Embed({
              color: 0xfee75c,
              description: '3. Toggle "Read user data" scope.\n4. Click "Save changes".',
              image: { url: "https://media.discordapp.net/attachments/1297352938250965023/1297353363293470791/image.png" },
            }),
            new Embed({
              color: 0xfee75c,
              description:
                '5. Copy your personal access token.\n6. Run the </authorize:1296583363905327114> command and paste your personal access token on the "pat" argument.',
              image: { url: "https://media.discordapp.net/attachments/1297352938250965023/1297354004950548540/image.png" },
            }),
          ],
        },
        { ephemeral: true },
      );
    }

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
