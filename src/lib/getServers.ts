import env from "../env";
import type { Servers } from "../types";

export async function getServers(modrinthPat: string) {
  const req = await fetch(`${env.PYRO_ARCHON_API}/servers`, {
    headers: { Authorization: `Bearer ${modrinthPat}` },
  });

  return {
    status: req.status,
    body: (await req.json()) as Servers,
  };
}
