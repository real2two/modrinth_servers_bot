import {
  Embed,
  Row,
  type CommandInteraction,
  type StringSelectMenuInteraction,
  type ButtonInteraction,
} from "@buape/carbon";
import { getModrinthPat, removeMarkdown } from "../utils";
import { getFsToken, getServer, getServerIcon, getServerUsage, getWsToken } from "../lib";
import { ServerStateColor, ServerStateText } from "../utils/serverStates";
import { PowerKillButton, PowerRestartButton, PowerStartButton, PowerStopButton, ServerReloadButton } from "../components";
import { SendConsoleButton } from "../components/send";

export async function handleServerInteraction(
  interaction: CommandInteraction | StringSelectMenuInteraction | ButtonInteraction,
  serverId: string,
) {
  // Get user's Modrinth PAT
  const modrinthPat = await getModrinthPat(interaction);
  if (!modrinthPat) return;

  const [{ status: serverStatus, body: server }, usage, icon] = await Promise.all([
    getServer(modrinthPat, serverId),

    new Promise(async (resolve) => {
      // Get WebSocket token
      const { status: wsStatus, body: wsBody } = await getWsToken(modrinthPat, serverId);
      if (wsStatus !== 200) return resolve(null);
      const { url: wsUrl, token: wsToken } = wsBody;

      // Get usage
      resolve(await getServerUsage(wsUrl, wsToken));
    }) as ReturnType<typeof getServerUsage>,

    new Promise(async (resolve) => {
      // Get file system token
      const { status: fsStatus, body: fsBody } = await getFsToken(modrinthPat, serverId);
      if (fsStatus !== 200) return resolve(null);
      const { url: fsUrl, token: fsToken } = fsBody;

      // Get server icon
      const { status: iconStatus, body: iconBlob } = await getServerIcon(fsUrl, fsToken);
      resolve(iconStatus === 200 ? iconBlob : null);
    }) as Promise<Blob | null>,
  ]);

  if (serverStatus !== 200 || !usage) {
    return interaction.reply("❌ Cannot find server or doesn't have access to server.", { ephemeral: true });
  }

  // Send interaction
  return interaction.reply(
    {
      embeds: [
        new Embed({
          color: ServerStateColor[usage.power],
          author: {
            name: "Server information",
          },
          thumbnail: {
            url: icon
              ? "attachment://server-icon-original.png"
              : "https://redacted.modrinth.com/_nuxt/minecraft_server_icon.DpF3iail.png",
          },
          description:
            // biome-ignore lint/style/useTemplate: This looks better than putting everything on one line.
            `<:id:1297301249640632422> **ID**: ${server.server_id}\n` +
            `<:name:1297265563776843906> **Name**: ${removeMarkdown(server.name)}\n` +
            `<:power:1297265042030592070> **Status**: ${ServerStateText[usage.power]}\n` +
            (usage.power === "running"
              ? `<:cpu:1297264557773029376> **CPU**: ${(usage.cpu_percent * 100).toFixed(2)}% / 100%\n` +
                `<:memory:1297262607648165898> **Memory**: ${(usage.ram_usage_bytes / 1.024e9).toFixed(1)}MB / ${(usage.ram_total_bytes / 1.024e9).toFixed(1)}MB\n` +
                `<:storage:1297264207825207336> **Storage**: ${(usage.storage_usage_bytes / 1.024e9).toFixed(1)}MB / ${(usage.storage_total_bytes / 1.024e9).toFixed(1)}MB\n`
              : "") +
            `<:domain:1297301020300279839> **Domain**: ${server.net.domain}.modrinth.gg\n` +
            `<:ip:1297301626616414259> **IP**: ${server.net.ip}:${server.net.port}\n` +
            `<:game:1297301145504583800> **Game**: ${server.game} ${server.mc_version}\n` +
            `<:loader:1297301888768933979> **Loader**: ${server.loader} ${server.loader_version}`,
        }),
      ],
      components: [
        usage.power === "running"
          ? new Row([
              new ServerReloadButton(),
              new SendConsoleButton(),
              new PowerRestartButton(),
              new PowerStopButton(),
              new PowerKillButton(),
            ])
          : new Row([new ServerReloadButton(), new PowerStartButton()]),
      ],
    },
    {
      files: icon
        ? [
            {
              name: "server-icon-original.png",
              data: icon,
            },
          ]
        : [],
    },
  );
}
