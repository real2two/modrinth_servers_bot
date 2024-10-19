import {
  ApplicationCommandOptionType,
  Command,
  type APIApplicationCommandBasicOption,
  type CommandInteraction,
} from "@buape/carbon";
import { autocompleteServers } from "../utils";
import { handlePowerInteraction } from "../handlers";

export class StartCommand extends Command {
  name = "start";
  description = "Start a server";
  defer = false;
  options: APIApplicationCommandBasicOption[] = [
    {
      type: ApplicationCommandOptionType.String,
      name: "server",
      description: "Enter the server you want to start",
      required: true,
      autocomplete: true,
    },
  ];

  autocomplete = autocompleteServers;

  async run(interaction: CommandInteraction) {
    const serverId = (interaction.options.getString("server") as string).trim();
    handlePowerInteraction(interaction, serverId, "Start");
  }
}

export class RestartCommand extends Command {
  name = "restart";
  description = "Restart a server";
  defer = false;
  options: APIApplicationCommandBasicOption[] = [
    {
      type: ApplicationCommandOptionType.String,
      name: "server",
      description: "Enter the server you want to restart",
      required: true,
      autocomplete: true,
    },
  ];

  autocomplete = autocompleteServers;

  async run(interaction: CommandInteraction) {
    const serverId = (interaction.options.getString("server") as string).trim();
    handlePowerInteraction(interaction, serverId, "Restart");
  }
}

export class StopCommand extends Command {
  name = "stop";
  description = "Stop a server";
  defer = false;
  options: APIApplicationCommandBasicOption[] = [
    {
      type: ApplicationCommandOptionType.String,
      name: "server",
      description: "Enter the server you want to stop",
      required: true,
      autocomplete: true,
    },
  ];

  autocomplete = autocompleteServers;

  async run(interaction: CommandInteraction) {
    const serverId = (interaction.options.getString("server") as string).trim();
    handlePowerInteraction(interaction, serverId, "Stop");
  }
}

export class KillCommand extends Command {
  name = "kill";
  description = "Kill a server";
  defer = false;
  options: APIApplicationCommandBasicOption[] = [
    {
      type: ApplicationCommandOptionType.String,
      name: "server",
      description: "Enter the server you want to kill",
      required: true,
      autocomplete: true,
    },
  ];

  autocomplete = autocompleteServers;

  async run(interaction: CommandInteraction) {
    const serverId = (interaction.options.getString("server") as string).trim();
    handlePowerInteraction(interaction, serverId, "Kill");
  }
}
