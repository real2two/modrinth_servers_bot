import { Button, ButtonStyle, type ButtonInteraction } from "@buape/carbon";
import { handlePowerInteraction } from "../handlers";

export class PowerStartButton extends Button {
  customId = "power-start";
  label = "Start";
  style = ButtonStyle.Success;

  async run(interaction: ButtonInteraction) {
    const serverId = interaction.message?.embeds[0].description?.split("\n")[0].slice(-36) as string;
    handlePowerInteraction(interaction, serverId, "Start");
  }
}

export class PowerRestartButton extends Button {
  customId = "power-restart";
  label = "Restart";
  style = ButtonStyle.Success;

  async run(interaction: ButtonInteraction) {
    const serverId = interaction.message?.embeds[0].description?.split("\n")[0].slice(-36) as string;
    handlePowerInteraction(interaction, serverId, "Restart");
  }
}
export class PowerStopButton extends Button {
  customId = "power-stop";
  label = "Stop";
  style = ButtonStyle.Danger;

  async run(interaction: ButtonInteraction) {
    const serverId = interaction.message?.embeds[0].description?.split("\n")[0].slice(-36) as string;
    handlePowerInteraction(interaction, serverId, "Stop");
  }
}
export class PowerKillButton extends Button {
  customId = "power-kill";
  label = "Kill";
  style = ButtonStyle.Danger;

  async run(interaction: ButtonInteraction) {
    const serverId = interaction.message?.embeds[0].description?.split("\n")[0].slice(-36) as string;
    handlePowerInteraction(interaction, serverId, "Kill");
  }
}
