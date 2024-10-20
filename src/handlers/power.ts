import type { ButtonInteraction, CommandInteraction } from "@buape/carbon";
import type { PowerState } from "../types";
import { getModrinthPat } from "../utils";
import { changePowerState, getPowerState, getWsToken } from "../lib";

export async function handlePowerInteraction(
  interaction: CommandInteraction | ButtonInteraction,
  serverId: string,
  power: PowerState,
) {
  // Get user's Modrinth PAT
  const modrinthPat = await getModrinthPat(interaction);
  if (!modrinthPat) return;

  // Get WebSocket token
  const { status: wsStatus, body: wsBody } = await getWsToken(modrinthPat, serverId);
  if (wsStatus !== 200) return interaction.reply("❌ Failed to get current power state.");
  const { url, token } = wsBody;

  // Check current power state
  const powerState = await getPowerState(url, token);
  if (!powerState) return interaction.reply("❌ Failed to get current power state. (2)");

  if (powerState === "running" && power === "Start") return interaction.reply("❌ The server is already running!");
  if (powerState !== "running" && !["Start", "Restart"].includes(power)) {
    return interaction.reply("❌ The server is already offline!");
  }

  // Change power state
  const { status } = await changePowerState(modrinthPat, serverId, power);
  if (status !== 201) return interaction.reply("❌ Failed to change power state.");

  // Send message
  return interaction.reply(`✅ Requested to change power state to \`${power}\`!`);
}
