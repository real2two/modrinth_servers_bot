import { getModrinthPat } from "../utils";
import type { AutocompleteInteraction } from "@buape/carbon";
import { getServersUser } from "../lib";

export function createAutocompleteServersEvent(
  includeShare = true,
  permissionRequired?: "CMD" | "START" | "RESTART" | "STOP" | "KILL",
) {
  return async (interaction: AutocompleteInteraction) => {
    const modrinthAuth = await getModrinthPat(interaction);
    const servers = await getServersUser(interaction.userId as string, modrinthAuth, includeShare, permissionRequired);

    interaction.respond(
      servers
        .filter((s) => s.name.trim().includes(interaction.options.getString("server")?.trim() || ""))
        .slice(0, 25)
        .map((s) => ({ name: s.name, value: s.server_id })),
    );
  };
}
