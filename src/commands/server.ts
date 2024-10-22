import {
  ApplicationCommandOptionType,
  Command,
  type APIApplicationCommandBasicOption,
  type CommandInteraction,
} from "@buape/carbon";
import { createAutocompleteServersEvent } from "../utils";
import { handleServerInteraction } from "../handlers";
import {
  PowerKillButton,
  PowerRestartButton,
  PowerStartButton,
  PowerStopButton,
  ServerReloadButton,
  SendConsoleButton,
  SendConsoleModal,
} from "../components";

export class ServerCommand extends Command {
  name = "server";
  description = "Get a server information";
  options: APIApplicationCommandBasicOption[] = [
    {
      type: ApplicationCommandOptionType.String,
      name: "server",
      description: "Enter the server you want to view",
      required: true,
      autocomplete: true,
    },
  ];
  components = [
    ServerReloadButton,
    PowerStartButton,
    PowerRestartButton,
    PowerStopButton,
    PowerKillButton,
    SendConsoleButton,
  ];
  modals = [SendConsoleModal];

  autocomplete = createAutocompleteServersEvent();

  async run(interaction: CommandInteraction) {
    const serverId = (interaction.options.getString("server") as string).trim();
    handleServerInteraction(interaction, serverId);
  }
}
