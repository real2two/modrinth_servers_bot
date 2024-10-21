import env from "../env";
import { and, db, eq, schema } from "../drizzle/main";
import { getModrinthPat } from "../utils";
import type { Server } from "../types";

export async function getServerUser(
  userId: string,
  modrinthAuth: string,
  serverId: string,
  permissions?: "CMD" | "START" | "RESTART" | "STOP" | "KILL",
) {
  const server = await getServerFetch(modrinthAuth, serverId);
  if (server.status === 200) return { modrinthAuth, status: server.status, server: server.body };

  const shares = await db.query.share.findMany({
    where: and(eq(schema.share.accessUserId, BigInt(userId)), eq(schema.share.serverId, serverId)),
  });

  for (const share of shares) {
    const shareModrinthAuth = await getModrinthPat({ userId: share.userId.toString() });
    const shareServer = await getServerFetch(shareModrinthAuth, serverId);
    if (shareServer.status === 200) {
      if (permissions && permissions === "CMD" && !share.canSendCommands) continue;
      if (permissions && permissions === "START" && !share.canStartServer) continue;
      if (permissions && permissions === "RESTART" && !share.canRestartServer) continue;
      if (permissions && permissions === "STOP" && !share.canStopServer) continue;
      if (permissions && permissions === "KILL" && !share.canKillServer) continue;

      return { modrinthAuth: shareModrinthAuth, status: shareServer.status, server: shareServer.body };
    }
  }

  return { modrinthAuth, status: server.status, server: server.body };
}

export async function getServerFetch(modrinthAuth: string, serverId: string) {
  const req = await fetch(`${env.PYRO_ARCHON_API}/servers/${encodeURIComponent(serverId)}`, {
    headers: { Authorization: `Bearer ${modrinthAuth}` },
  });

  return {
    status: req.status,
    body: (req.status === 200 ? await req.json() : null) as Server,
  };
}
