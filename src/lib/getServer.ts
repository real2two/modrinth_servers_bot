import env from "../env";
import type { Server } from "../types";

export async function getServer(modrinthPat: string, serverId: string) {
  const req = await fetch(`${env.PYRO_ARCHON_API}/servers/${encodeURIComponent(serverId)}`, {
    headers: { Authorization: `Bearer ${modrinthPat}` },
  });

  return {
    status: req.status,
    body: (req.status === 200 ? await req.json() : null) as Server,
  };
}
