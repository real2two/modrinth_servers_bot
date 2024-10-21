import env from "../env";
import type { Server } from "../types";

export async function getServer(modrinthAuth: string, serverId: string) {
  const req = await fetch(`${env.PYRO_ARCHON_API}/servers/${encodeURIComponent(serverId)}`, {
    headers: { Authorization: `Bearer ${modrinthAuth}` },
  });

  return {
    status: req.status,
    body: (req.status === 200 ? await req.json() : null) as Server,
  };
}
