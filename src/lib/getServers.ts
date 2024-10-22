import env from "../env";
import { db, schema, eq } from "../drizzle/main";
import type { Servers } from "../types";
import { getModrinthPat } from "../utils";

const cachedServers = new Map<string, Servers>();

export async function getServersFetch(modrinthAuth: string) {
  const cachedServer = cachedServers.get(modrinthAuth);
  if (cachedServer) return { status: 200, body: cachedServer };

  const req = await fetch(`${env.PYRO_ARCHON_API}/servers`, {
    headers: { Authorization: `Bearer ${modrinthAuth}` },
  });

  if (req.status === 200) {
    const serversBody = (await req.json()) as Servers;

    if (!cachedServers.get(modrinthAuth)) {
      // Race condition check
      cachedServers.set(modrinthAuth, serversBody);

      setTimeout(() => {
        cachedServers.delete(modrinthAuth);
      }, 60000);
    }

    return {
      status: req.status,
      body: serversBody,
    };
  }

  return {
    status: req.status,
    body: { servers: [] },
  };
}

export async function getServersUser(
  userId: string,
  modrinthAuth: string,
  includeShare = true,
  permissionRequired?: "CMD" | "START" | "RESTART" | "STOP" | "KILL",
) {
  const { status, body } = await getServersFetch(modrinthAuth);
  const servers = status === 200 ? [...body.servers] : [];

  if (includeShare) {
    const shares = await db
      .select()
      .from(schema.share)
      .where(eq(schema.share.accessUserId, BigInt(userId)));

    const cachedRequests = new Map<string, Awaited<ReturnType<typeof getServersFetch>>>();

    for (const share of shares) {
      const shareUserId = share.userId.toString();

      if (permissionRequired) {
        if (permissionRequired === "CMD" && !share.canSendCommands) continue;
        if (permissionRequired === "START" && !share.canStartServer) continue;
        if (permissionRequired === "RESTART" && !share.canRestartServer) continue;
        if (permissionRequired === "STOP" && !share.canStopServer) continue;
        if (permissionRequired === "KILL" && !share.canKillServer) continue;
      }

      if (!cachedRequests.get(shareUserId)) {
        const shareModrinthAuth = await getModrinthPat({ userId: shareUserId });
        const shareServers = await getServersFetch(shareModrinthAuth);
        cachedRequests.set(shareUserId, shareServers);
      }

      const { status, body } = cachedRequests.get(shareUserId) as Awaited<ReturnType<typeof getServersFetch>>;
      const server = (status === 200 ? body.servers : []).find((s) => s.server_id);

      if (server) servers.push(server);
    }
  }

  console.log(servers);

  return servers;
}
