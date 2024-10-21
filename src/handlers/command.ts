import type { ButtonInteraction, CommandInteraction, ModalInteraction } from "@buape/carbon";
import { getModrinthPat } from "../utils";
import { getWsToken, sendConsoleCommand } from "../lib";

export async function handleCommandInteraction(
  interaction: CommandInteraction | ButtonInteraction | ModalInteraction,
  serverId: string,
  command: string,
) {
  // Get user's Modrinth PAT
  const modrinthAuth = await getModrinthPat(interaction);
  if (!modrinthAuth) return;

  // Get WebSocket token
  const { status: wsStatus, body: wsBody } = await getWsToken(modrinthAuth, serverId);
  if (wsStatus !== 200) return interaction.reply(`❌ Failed to send console message. *(status: \`${wsStatus}\`)*`);
  const { url, token } = wsBody;

  // Send console message
  const success = await sendConsoleCommand(url, token, command);
  if (!success) return interaction.reply("❌ Failed to send console message. *(failed WebSocket)*");

  // Send message
  return interaction.reply("✅ Requested to run the console command!");
}
