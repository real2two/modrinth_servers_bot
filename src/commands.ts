import { AuthorizeCommand } from "./commands/authorize";
import { StartCommand, RestartCommand, StopCommand, KillCommand } from "./commands/power";
import { SendConsoleCommand } from "./commands/send";
import { ServerCommand } from "./commands/server";
import { ServersCommand } from "./commands/servers";
import { ShareCommand } from "./commands/share";

export default [
  new AuthorizeCommand(),
  new StartCommand(),
  new RestartCommand(),
  new StopCommand(),
  new KillCommand(),
  new SendConsoleCommand(),
  new ServerCommand(),
  new ServersCommand(),
  new ShareCommand(),
];
