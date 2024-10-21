import type { ButtonInteraction, CommandInteraction, ModalInteraction } from "@buape/carbon";
import { getModrinthPat } from "../utils";
import { getServerUser, getWsToken, sendConsoleCommand } from "../lib";

export async function handleCommandInteraction(
  interaction: CommandInteraction | ButtonInteraction | ModalInteraction,
  serverId: string,
  command: string,
) {
  // Get user's Modrinth PAT
  const modrinthAuth = await getModrinthPat(interaction);

  // Get server
  const { status: serverStatus, modrinthAuth: useModrinthAuth } = await getServerUser(
    interaction.userId as string,
    modrinthAuth,
    serverId,
    "CMD",
  );
  if (serverStatus !== 200) {
    return interaction.reply(`❌ Missing access. *(status: \`${serverStatus}\`)*`);
  }

  // Get WebSocket token
  const { status: wsStatus, body: wsBody } = await getWsToken(useModrinthAuth, serverId);
  if (wsStatus !== 200) return interaction.reply(`❌ Failed to send console message. *(status: \`${wsStatus}\`)*`);
  const { url, token } = wsBody;

  // Send console message
  const success = await sendConsoleCommand(url, token, command);
  if (!success) return interaction.reply("❌ Failed to send console message. *(failed WebSocket)*");

  // Send message
  return interaction.reply("✅ Requested to run the console command!");
}
