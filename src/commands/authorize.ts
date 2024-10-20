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
  description = "Enter your authorization token from Modrinth to this Discord bot";
  defer = false;
  options: APIApplicationCommandBasicOption[] = [
    {
      type: ApplicationCommandOptionType.String,
      name: "pat",
      description: "Enter your authorization token with the 'Read user data' scope here",
      required: false,
    },
  ];

  async run(interaction: CommandInteraction) {
    const modrinthPat = interaction.options.getString("pat")?.trim();

    if (!modrinthPat) {
      return interaction.reply({
        embeds: [
          new Embed({
            color: 0xfee75c,
            title: "How to authorize your Modrinth account to this Discord bot",
            description: `1. Go to https://redacted.modrinth.com/servers/manage\n2. On your search bar, type out \`javascript:\` then paste the script below after that text: *(all you're doing in the sript below is getting the cookie named "auth-token")*\n\`\`\`\nalert(getCookie("auth-token"));function getCookie(t){let e=t+"=",n=decodeURIComponent(document.cookie).split(";");for(let o=0;o<n.length;o++){let i=n[o];for(;" "==i.charAt(0);)i=i.substring(1);if(0==i.indexOf(e))return i.substring(e.length,i.length)}return""}\n\`\`\`\n3. Copy the token.\n4. Run the </authorize:1296583363905327114> command and paste your personal access token on the "pat" argument.\n5. Then you're done! You will be logged out of your Modrinth account, because of how session refreshing works on Modrinth.`,
            image: { url: "https://media.discordapp.net/attachments/1297352938250965023/1297391280988487733/image.png" },
          }),
        ],
      });
      // return interaction.reply(
      //   {
      //     embeds: [
      //       new Embed({
      //         color: 0xfee75c,
      //         title: "How to authorize your Modrinth account to this Discord bot",
      //         description: '1. Go to https://redacted.modrinth.com/settings/pats\n2. Click "Create a PAT".',
      //         image: { url: "https://media.discordapp.net/attachments/1297352938250965023/1297352975265828874/image.png" },
      //       }),
      //       new Embed({
      //         color: 0xfee75c,
      //         description: '3. Toggle "Read user data" scope.\n4. Click "Save changes".',
      //         image: { url: "https://media.discordapp.net/attachments/1297352938250965023/1297353363293470791/image.png" },
      //       }),
      //       new Embed({
      //         color: 0xfee75c,
      //         description:
      //           '5. Copy your personal access token.\n6. Run the </authorize:1296583363905327114> command and paste your personal access token on the "pat" argument.',
      //         image: { url: "https://media.discordapp.net/attachments/1297352938250965023/1297354004950548540/image.png" },
      //       }),
      //     ],
      //   },
      //   { ephemeral: true },
      // );
    }

    if (!modrinthPat.startsWith("mra_")) {
      return interaction.reply("❌ This Discord bot only supports `mra` tokens currently.", { ephemeral: true });
    }

    const userRequest = await fetch(`${env.MODRINTH_API}/_internal/session/refresh`, {
      method: "post",
      headers: { authorization: modrinthPat },
    });

    if (userRequest.status !== 200) {
      return interaction.reply(
        `❌ Could not validate access token! *(status: \`${userRequest.status}\`)*\n-# Make sure your personal access token has the \`Read user data\` scope.`,
        { ephemeral: true },
      );
    }

    const { session } = await userRequest.json();

    await db
      .insert(schema.users)
      .values({
        userId: BigInt(interaction.userId as string),
        modrinthPat: session,
      })
      .onDuplicateKeyUpdate({ set: { modrinthPat: session } });

    return interaction.reply("✅ Successfully saved your access token!", { ephemeral: true });
  }
}
