import { Command, Embed, Row, type CommandInteraction } from "@buape/carbon";
import { ServersSelect } from "../components";
import { getModrinthPat, removeMarkdown } from "../utils";
import { getServersUser } from "../lib";

export class ServersCommand extends Command {
  name = "servers";
  description = "Get all your servers";
  defer = false;
  // @ts-ignore This is correct code. Carbon has wrong types.
  components = [ServersSelect];

  async run(interaction: CommandInteraction) {
    // Get user's Modrinth PAT
    const modrinthAuth = await getModrinthPat(interaction);

    // Get servers
    const servers = await getServersUser(interaction.userId as string, modrinthAuth);

    // Send message
    let serversText = !servers.length
      ? "You don't have any servers!"
      : servers
          .map(
            (s) =>
              `- **${removeMarkdown(s.name)}**: \`${s.net.domain}.modrinth.gg\` (${s.game} ${s.mc_version || "??"}, ${s.loader || "??"} ${s.loader_version || "??"})`,
          )
          .join("\n");
    if (serversText.length > 4000) {
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
      components: servers.length ? [new Row([new ServersSelect(servers)])] : [],
    });
  }
}
