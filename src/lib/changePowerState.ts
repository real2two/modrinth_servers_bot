import env from "../env";
import type { PowerState } from "../types";

export async function changePowerState(modrinthPat: string, serverId: string, action: PowerState) {
  const req = await fetch(`${env.PYRO_ARCHON_API}/servers/${encodeURIComponent(serverId)}/power`, {
    method: "post",
    headers: { Authorization: `Bearer ${modrinthPat}`, "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
  });

  return { status: req.status };
}
