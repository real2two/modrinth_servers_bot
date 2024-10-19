import {
  ApplicationCommandOptionType,
  Command,
  type APIApplicationCommandBasicOption,
  type CommandInteraction,
} from "@buape/carbon";
import { autocompleteServers } from "../utils";
import { handleCommandInteraction } from "../handlers";

export class SendConsoleCommand extends Command {
  name = "send";
  description = "Send a console command";
  defer = false;
  options: APIApplicationCommandBasicOption[] = [
    {
      type: ApplicationCommandOptionType.String,
      name: "server",
      description: "Enter the server you want to send a console command at",
      required: true,
      autocomplete: true,
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "command",
      description: "Enter the command you want to send to the server",
      required: true,
    },
  ];

  autocomplete = autocompleteServers;

  async run(interaction: CommandInteraction) {
    const serverId = (interaction.options.getString("server") as string).trim();
    const command = interaction.options.getString("command") as string;
    handleCommandInteraction(interaction, serverId, command);
  }
}
