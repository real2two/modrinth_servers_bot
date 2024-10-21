import env from "../env";
import type { Servers } from "../types";

export async function getServers(modrinthAuth: string) {
  const req = await fetch(`${env.PYRO_ARCHON_API}/servers`, {
    headers: { Authorization: `Bearer ${modrinthAuth}` },
  });

  return {
    status: req.status,
    body: (await req.json()) as Servers,
  };
}
