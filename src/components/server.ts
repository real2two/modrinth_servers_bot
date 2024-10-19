import { Button, ButtonStyle, type ButtonInteraction } from "@buape/carbon";
import { handleServerInteraction } from "../handlers";

export class ServerReloadButton extends Button {
  customId = "server-reload";
  label = "";
  style = ButtonStyle.Secondary;
  emoji = {
    name: "reload",
    id: "1297307779899461673",
  };

  async run(interaction: ButtonInteraction) {
    const serverId = interaction.message?.embeds[0].description?.split("\n")[0].slice(-36) as string;
    handleServerInteraction(interaction, serverId);
  }
}
