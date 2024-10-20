import env from "../env";
import { getModrinthPat } from "../utils";
import type { AutocompleteInteraction } from "@buape/carbon";
import type { Servers } from "../types";

export async function autocompleteServers(interaction: AutocompleteInteraction) {
  const modrinthPat = await getModrinthPat(interaction, true);
  if (!modrinthPat) return;

  const serversRequest = await fetch(`${env.PYRO_ARCHON_API}/servers`, {
    headers: { Authorization: `Bearer ${modrinthPat}` },
  });
  if (serversRequest.status !== 200) return interaction.respond([{ name: "Error: Failed to authenticate", value: "null" }]);

  const { servers } = (await serversRequest.json()) as Servers;
  interaction.respond(
    servers
      .filter((s) => s.name.trim().includes(interaction.options.getString("server")?.trim() || ""))
      .slice(0, 25)
      .map((s) => ({ name: s.name, value: s.server_id })),
  );
}
