import {
  Button,
  ButtonStyle,
  Modal,
  Row,
  TextInput,
  TextInputStyle,
  type ButtonInteraction,
  type ModalInteraction,
} from "@buape/carbon";
import { getModrinthPat } from "../utils";
import { getServerUser } from "../lib";
import { handleCommandInteraction } from "../handlers";

export class SendConsoleButton extends Button {
  customId = "console-send";
  label = "Send command";
  style = ButtonStyle.Primary;

  async run(interaction: ButtonInteraction) {
    // Get user's Modrinth PAT
    const modrinthAuth = await getModrinthPat(interaction);

    // Check if user can access server
    const serverId = interaction.message?.embeds[0].description?.split("\n")[0].slice(-36) as string;

    const { status, server } = await getServerUser(interaction.userId as string, modrinthAuth, serverId, "CMD");
    if (!server) {
      return interaction.reply(`❌ Doesn't have access to server. *(status: \`${status}\`)*`);
    }

    // Create form
    return interaction.showModal(new SendConsoleModal());
  }
}

class SendConsoleTextInput extends TextInput {
  label = "Send a command";
  customId = "command";
  style = TextInputStyle.Short;
  required = true;
}

export class SendConsoleModal extends Modal {
  title = "Send console command";
  customId = "console-send-confirm";

  components = [new Row([new SendConsoleTextInput()])];

  async run(interaction: ModalInteraction) {
    const serverId = interaction.message?.embeds[0].description?.split("\n")[0].slice(-36) as string;
    const command = interaction.fields.getText("command") as string;
    handleCommandInteraction(interaction, serverId, command);
  }
}
