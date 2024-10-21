import type { ButtonInteraction, CommandInteraction } from "@buape/carbon";
import type { PowerState } from "../types";
import { getModrinthPat } from "../utils";
import { changePowerState, getPowerState, getServerUser, getWsToken } from "../lib";

enum PowerToPowerCaps {
  Start = "START",
  Restart = "RESTART",
  Stop = "STOP",
  Kill = "KILL",
}

export async function handlePowerInteraction(
  interaction: CommandInteraction | ButtonInteraction,
  serverId: string,
  power: PowerState,
) {
  // Get user's Modrinth PAT
  const modrinthAuth = await getModrinthPat(interaction);

  // Get server
  const { status: serverStatus, modrinthAuth: useModrinthAuth } = await getServerUser(
    interaction.userId as string,
    modrinthAuth,
    serverId,
    PowerToPowerCaps[power],
  );
  if (serverStatus !== 200) {
    return interaction.reply(`❌ Missing access. *(status: \`${serverStatus}\`)*`);
  }

  // Get WebSocket token
  const { status: wsStatus, body: wsBody } = await getWsToken(useModrinthAuth, serverId);
  if (wsStatus !== 200) return interaction.reply(`❌ Failed to get current power state. *(status: \`${wsStatus}\`)*`);
  const { url, token } = wsBody;

  // Check current power state
  const powerState = await getPowerState(url, token);
  if (!powerState) return interaction.reply("❌ Failed to get current power state. *(failed WebSocket)*");

  if (powerState === "running" && power === "Start") return interaction.reply("❌ The server is already running!");
  if (powerState !== "running" && !["Start", "Restart"].includes(power)) {
    return interaction.reply("❌ The server is already offline!");
  }

  // Change power state
  const { status } = await changePowerState(useModrinthAuth, serverId, power);
  if (status !== 201) return interaction.reply(`❌ Failed to change power state. *(status: \`${status}\`)*`);

  // Send message
  return interaction.reply(`✅ Requested to change power state to \`${power}\`!`);
}
