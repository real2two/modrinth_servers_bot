import env from "../env";
import type { PowerState } from "../types";

export async function changePowerState(modrinthAuth: string, serverId: string, action: PowerState) {
  const req = await fetch(`${env.PYRO_ARCHON_API}/servers/${encodeURIComponent(serverId)}/power`, {
    method: "post",
    headers: { Authorization: `Bearer ${modrinthAuth}`, "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
  });

  return { status: req.status };
}
