import env from "../env";
import type { WSAuth } from "../types";

export async function getWsToken(modrinthPat: string, serverId: string) {
  const req = await fetch(`${env.PYRO_ARCHON_API}/servers/${encodeURIComponent(serverId)}/ws`, {
    headers: { Authorization: `Bearer ${modrinthPat}` },
  });

  return {
    status: req.status,
    body: (req.status === 200 ? await req.json() : null) as WSAuth,
  };
}
