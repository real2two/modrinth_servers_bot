import env from "../env";
import { db, schema, eq } from "../drizzle/main";

export async function getModrinthPat(interaction: { userId?: string }): Promise<string> {
  // Get saved user information from database
  const userId = BigInt(interaction.userId as string);
  const user = await db.query.users.findFirst({
    where: eq(schema.users.userId, userId),
  });

  if (
    // Cannot find user in database
    !user ||
    // Check if authorization token expired
    Date.now() > user.modrinthRefreshExpires.getTime()
  ) {
    // Returns no authorization token
    return "";
  }

  // If refresh token hasn't expired, return user from database
  if (Date.now() > user.modrinthExpires.getTime()) return user.modrinthAuth;

  console.log("HUHH??");

  // Refresh token and return new Modrinth authorization token
  const refreshRequest = await fetch(`${env.MODRINTH_API}/_internal/session/refresh`, {
    method: "post",
    headers: { authorization: user.modrinthAuth },
  });

  if (refreshRequest.status !== 200) return user.modrinthAuth; // Failed to refresh token

  const { session: newModrinthAuth, expires, refresh_expires } = await refreshRequest.json();
  await db
    .insert(schema.users)
    .values({
      userId,
      modrinthAuth: newModrinthAuth,
      modrinthExpires: new Date(expires),
      modrinthRefreshExpires: new Date(refresh_expires),
    })
    .onDuplicateKeyUpdate({
      set: {
        modrinthAuth: newModrinthAuth,
        modrinthExpires: new Date(expires),
        modrinthRefreshExpires: new Date(refresh_expires),
      },
    });

  return newModrinthAuth;
}
