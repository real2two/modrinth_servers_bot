import { Command, Embed, MessageFlags, Row, type CommandInteraction } from "@buape/carbon";
import { ServersSelect } from "../components";
import { getModrinthPat, removeMarkdown } from "../utils";
import { getServers } from "../lib";

export class ServersCommand extends Command {
  name = "servers";
  description = "Get all your servers";
  defer = false;
  // @ts-ignore This is correct code. Carbon has wrong types.
  components = [ServersSelect];

  async run(interaction: CommandInteraction) {
    // Get user's Modrinth PAT
    const modrinthPat = await getModrinthPat(interaction);
    if (!modrinthPat) return;

    // Get servers
    const { status, body } = await getServers(modrinthPat);
    if (status !== 200) {
      return interaction.reply(
        `❌ Returned an invalid status code. *(status: \`${status}\`)*\n-# Has your authorization token been revoked or expired?`,
        { ephemeral: true },
      );
    }
    const { servers } = body;

    // Send message
    let serversText = !servers.length
      ? "You don't have any servers!"
      : servers
          .map(
            (s) =>
              `- **${removeMarkdown(s.name)}**: \`${s.net.domain}.modrinth.gg\` (${s.game} ${s.mc_version}, ${s.loader} ${s.loader_version})`,
          )
          .join("\n");
    if (serversText.length > 4096) {
      serversText = "You have too many servers for this bot to handle! This bot doesn't support a pagination yet!";
    }

    return interaction.reply({
      embeds: [
        new Embed({
          color: 0x1bd96a,
          author: {
            name: "Servers",
          },
          description: serversText,
        }),
      ],
      components: [new Row([new ServersSelect(servers)])],
    });
  }
}
