import { StringSelectMenu, type APISelectMenuOption, type StringSelectMenuInteraction } from "@buape/carbon";
import type { Servers } from "../types";
import { handleServerInteraction } from "../handlers";

export class ServersSelect extends StringSelectMenu {
  customId = "servers-select";
  placeholder = "Select a server to view";
  options: APISelectMenuOption[] = [];
  defer = false;

  constructor(servers: Servers["servers"]) {
    super();

    if (!servers) return;
    for (const s of servers) {
      this.options.push({
        label: s.name,
        value: s.server_id,
        description: `${s.net.domain}.modrinth.gg (${s.game} ${s.mc_version}, ${s.loader} ${s.loader_version})`,
      });
    }
  }

  async run(interaction: StringSelectMenuInteraction) {
    const [serverId] = interaction.values;
    handleServerInteraction(interaction, serverId);
  }
}
