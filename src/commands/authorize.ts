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
      name: "auth",
      description: "Enter your authorization token with the 'Read user data' scope here",
      required: false,
    },
  ];

  async run(interaction: CommandInteraction) {
    const modrinthAuth = interaction.options.getString("auth")?.trim();

    if (!modrinthAuth) {
      return interaction.reply(
        {
          embeds: [
            new Embed({
              color: 0xfee75c,
              title: "How to authorize your Modrinth account to this Discord bot",
              description: `1. Go to https://modrinth.com/servers/manage\n2. On your search bar, type out \`javascript:\` then paste the script below after that text: *(all you're doing in the sript below is getting the cookie named "auth-token")*\n\`\`\`\nalert(getCookie("auth-token"));function getCookie(t){let e=t+"=",n=decodeURIComponent(document.cookie).split(";");for(let o=0;o<n.length;o++){let i=n[o];for(;" "==i.charAt(0);)i=i.substring(1);if(0==i.indexOf(e))return i.substring(e.length,i.length)}return""}\n\`\`\`\n3. Copy the token.\n4. Run the </authorize:1296583363905327114> command and paste your authorization token on the "auth" argument.\n5. Then you're done! You will be logged out of your Modrinth account, because of how session refreshing works on Modrinth.`,
              image: { url: "https://media.discordapp.net/attachments/1297352938250965023/1297708846550356018/image.png" },
            }),
          ],
        },
        { ephemeral: true },
      );
      // return interaction.reply(
      //   {
      //     embeds: [
      //       new Embed({
      //         color: 0xfee75c,
      //         title: "How to authorize your Modrinth account to this Discord bot",
      //         description: '1. Go to https://modrinth.com/settings/pats\n2. Click "Create a PAT".',
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
      //           '5. Copy your personal access token.\n6. Run the </authorize:1296583363905327114> command and paste your personal access token on the "auth" argument.',
      //         image: { url: "https://media.discordapp.net/attachments/1297352938250965023/1297354004950548540/image.png" },
      //       }),
      //     ],
      //   },
      //   { ephemeral: true },
      // );
    }

    if (!modrinthAuth.startsWith("mra_")) {
      return interaction.reply("❌ This Discord bot only supports `mra` tokens currently.", { ephemeral: true });
    }

    const refreshRequest = await fetch(`${env.MODRINTH_API}/_internal/session/refresh`, {
      method: "post",
      headers: { authorization: modrinthAuth },
    });

    if (refreshRequest.status !== 200) {
      return interaction.reply(
        `❌ Could not validate authorization token! *(status: \`${refreshRequest.status}\`)*\n-# Make sure your authorization token has the \`Read user data\` scope.`,
        { ephemeral: true },
      );
    }

    const { session, expires, refresh_expires } = await refreshRequest.json();

    await db
      .insert(schema.users)
      .values({
        userId: BigInt(interaction.userId as string),
        modrinthAuth: session,
        modrinthExpires: new Date(expires),
        modrinthRefreshExpires: new Date(refresh_expires),
      })
      .onDuplicateKeyUpdate({
        set: {
          modrinthAuth: session,
          modrinthExpires: new Date(expires),
          modrinthRefreshExpires: new Date(refresh_expires),
        },
      });

    return interaction.reply("✅ Successfully saved your authorization token!", { ephemeral: true });
  }
}
