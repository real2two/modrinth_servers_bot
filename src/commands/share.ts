import {
  ApplicationCommandOptionType,
  Command,
  CommandWithSubcommands,
  Embed,
  type APIApplicationCommandBasicOption,
  type CommandInteraction,
} from "@buape/carbon";
import { and, db, eq, schema } from "../drizzle/main";
import { createAutocompleteServersEvent, getModrinthPat } from "../utils";
import { getServerFetch } from "../lib";

class ShareListCommand extends Command {
  name = "list";
  description = "List all users with permission on a server";
  defer = false;
  options: APIApplicationCommandBasicOption[] = [
    {
      type: ApplicationCommandOptionType.String,
      name: "server",
      description: "Enter the server you want to view",
      required: true,
      autocomplete: true,
    },
  ];

  autocomplete = createAutocompleteServersEvent(false);

  async run(interaction: CommandInteraction) {
    // Get options
    const serverId = (interaction.options.getString("server") as string).trim();

    // Get user's Modrinth PAT
    const modrinthAuth = await getModrinthPat(interaction);

    // Check if user has access to server
    const { status, body: server } = await getServerFetch(modrinthAuth, serverId);
    if (status !== 200) {
      return interaction.reply(`❌ Missing access. *(status: \`${status}\`)*`);
    }

    // Get user from database
    const shares = await db.query.share.findMany({
      where: and(eq(schema.share.userId, BigInt(interaction.userId as string)), eq(schema.share.serverId, server.server_id)),
    });

    // List permissions of user
    const sharesWithPerms = [];
    for (const share of shares) {
      const perms = [];
      if (share.canSendCommands) perms.push("CMD");
      if (share.canStartServer) perms.push("START");
      if (share.canRestartServer) perms.push("RESTART");
      if (share.canStopServer) perms.push("STOP");
      if (share.canKillServer) perms.push("KILL");
      sharesWithPerms.push({ id: share.accessUserId, perms });
    }

    // Send message
    interaction.reply({
      embeds: [
        new Embed({
          author: { name: "Who has access to this server?" },
          description: shares.length
            ? sharesWithPerms.map((s) => `- <@${s.id}>: \`${s.perms.join(" | ")}\``).join("\n")
            : "You haven't shared this server with anyone else.",
          footer: { text: `Server ID: ${server.server_id}` },
        }),
      ],
    });
  }
}

class ShareInfoCommand extends Command {
  name = "info";
  description = "Check what permissions a user has on a server";
  defer = false;
  options: APIApplicationCommandBasicOption[] = [
    {
      type: ApplicationCommandOptionType.String,
      name: "server",
      description: "Enter the server you want to view",
      required: true,
      autocomplete: true,
    },
    {
      type: ApplicationCommandOptionType.User,
      name: "user",
      description: "Enter the user to add access to",
      required: true,
    },
  ];

  autocomplete = createAutocompleteServersEvent(false);

  async run(interaction: CommandInteraction) {
    // Get options
    const serverId = (interaction.options.getString("server") as string).trim();
    const accessUserId = BigInt(interaction.options.getUser("user")?.id as string);

    // Get user's Modrinth PAT
    const modrinthAuth = await getModrinthPat(interaction);

    // Check if user has access to server
    const { status, body: server } = await getServerFetch(modrinthAuth, serverId);
    if (status !== 200) {
      return interaction.reply(`❌ Missing access. *(status: \`${status}\`)*`);
    }

    // Get user from database
    const share = await db.query.share.findFirst({
      where: and(
        eq(schema.share.userId, BigInt(interaction.userId as string)),
        eq(schema.share.serverId, server.server_id),
        eq(schema.share.accessUserId, accessUserId),
      ),
    });

    if (!share) return interaction.reply("❌ This user does not have access to this server from you!");

    // Send message
    return interaction.reply({
      embeds: [
        new Embed({
          description: `### <@${accessUserId}>'s permissions\n- Can send command: ${share.canSendCommands ? "✅" : "❌"}\n- Can start server: ${share.canStartServer ? "✅" : "❌"}\n- Can restart server: ${share.canRestartServer ? "✅" : "❌"}\n- Can stop server: ${share.canStopServer ? "✅" : "❌"}\n- Can kill server: ${share.canKillServer ? "✅" : "❌"}`,
          footer: { text: `Server ID: ${server.server_id}` },
        }),
      ],
    });
  }
}

class ShareAddCommand extends Command {
  name = "add";
  description = "Add or update a user's access to a server";
  defer = false;
  options: APIApplicationCommandBasicOption[] = [
    {
      type: ApplicationCommandOptionType.String,
      name: "server",
      description: "Enter the server you want to allow the user to control",
      required: true,
      autocomplete: true,
    },
    {
      type: ApplicationCommandOptionType.User,
      name: "user",
      description: "Enter the user to add access to",
      required: true,
    },
    {
      type: ApplicationCommandOptionType.Boolean,
      name: "can_send_commands",
      description: "Allow user to send console commands",
      required: false,
    },
    {
      type: ApplicationCommandOptionType.Boolean,
      name: "can_start_server",
      description: "Allow user to start the server",
      required: false,
    },
    {
      type: ApplicationCommandOptionType.Boolean,
      name: "can_restart_server",
      description: "Allow user to restart the server",
      required: false,
    },
    {
      type: ApplicationCommandOptionType.Boolean,
      name: "can_stop_server",
      description: "Allow user to stop the server",
      required: false,
    },
    {
      type: ApplicationCommandOptionType.Boolean,
      name: "can_kill_server",
      description: "Allow user to kill the server",
      required: false,
    },
  ];

  autocomplete = createAutocompleteServersEvent(false);

  async run(interaction: CommandInteraction) {
    // Get user ID as BigInt
    const userId = BigInt(interaction.userId as string);

    // Get options
    const serverId = (interaction.options.getString("server") as string).trim();
    const accessUserId = BigInt(interaction.options.getUser("user")?.id as string);
    const canSendCommands = !!interaction.options.getBoolean("can_send_commands");
    const canStartServer = !!interaction.options.getBoolean("can_start_server");
    const canRestartServer = !!interaction.options.getBoolean("can_restart_server");
    const canStopServer = !!interaction.options.getBoolean("can_stop_server");
    const canKillServer = !!interaction.options.getBoolean("can_kill_server");

    // Get user's Modrinth PAT
    const modrinthAuth = await getModrinthPat(interaction);

    // Check if user has access to server
    const { status, body: server } = await getServerFetch(modrinthAuth, serverId);
    if (status !== 200) {
      return interaction.reply(`❌ Missing access. *(status: \`${status}\`)*`);
    }

    // Cannot give yourself permissions
    if (userId === accessUserId) {
      return interaction.reply("❌ Cannot give yourself permissions.");
    }

    // If no permissions were set, disallow running the command
    if (!canSendCommands && !canStartServer && !canRestartServer && !canStopServer && !canKillServer) {
      return interaction.reply(
        "❌ Cannot give user no permissions. Make sure to set one of the `can_` parameters on the command as `True`!",
      );
    }

    // Cannot give restart server without giving start server
    if (canRestartServer && !canStartServer) {
      return interaction.reply("❌ Cannot give restart server permissions without giving start server permissions.");
    }

    // Get shares that have access
    const shares = await db.query.share.findMany({
      where: and(eq(schema.share.userId, userId), eq(schema.share.serverId, server.server_id)),
    });

    // Enforce a max shares limit
    if (shares.length >= 15 && !shares.find((u) => u.accessUserId === accessUserId)) {
      return interaction.reply("❌ Reached the maximum users you can share this server with. (15)");
    }

    // Add to database
    await db
      .insert(schema.share)
      .values({
        userId,
        serverId: server.server_id,
        accessUserId,
        canSendCommands,
        canStartServer,
        canRestartServer,
        canStopServer,
        canKillServer,
      })
      .onDuplicateKeyUpdate({
        set: { canSendCommands, canStartServer, canRestartServer, canStopServer, canKillServer },
      });

    // Recheck shares length (race condition-check) and remove share if the limit exceeds
    const recheckShares = await db.query.share.findMany({
      where: and(eq(schema.share.userId, userId), eq(schema.share.serverId, server.server_id)),
    });
    if (recheckShares.length > 15 && !shares.find((u) => u.accessUserId === accessUserId)) {
      await db
        .delete(schema.share)
        .where(
          and(
            eq(schema.share.userId, userId),
            eq(schema.share.serverId, server.server_id),
            eq(schema.share.accessUserId, accessUserId),
          ),
        );

      return interaction.reply("❌ Reached the maximum users you can share this server with. (15)");
    }

    // Send message
    return interaction.reply(
      `✅ Successfully updated <@${accessUserId}>'s permissions of the server with the ID \`${serverId}\`!`,
    );
  }
}

class ShareRemoveCommand extends Command {
  name = "remove";
  description = "Remove a user's access to a server";
  defer = false;
  options: APIApplicationCommandBasicOption[] = [
    {
      type: ApplicationCommandOptionType.String,
      name: "server",
      description: "Enter the server you want to remove a user's access to",
      required: true,
      autocomplete: true,
    },
    {
      type: ApplicationCommandOptionType.User,
      name: "user",
      description: "Enter the user to remove access to",
      required: true,
    },
  ];

  autocomplete = createAutocompleteServersEvent(false);

  async run(interaction: CommandInteraction) {
    // Get user ID as BigInt
    const userId = BigInt(interaction.userId as string);

    // Get options
    const serverId = (interaction.options.getString("server") as string).trim();
    const accessUserId = BigInt(interaction.options.getUser("user")?.id as string);

    // Get user's Modrinth PAT
    const modrinthAuth = await getModrinthPat(interaction);

    // Check if user has access to server
    const { status, body: server } = await getServerFetch(modrinthAuth, serverId);
    if (status !== 200) {
      return interaction.reply(`❌ Missing access. *(status: \`${status}\`)*`);
    }

    // Cannot give yourself permissions
    if (userId === accessUserId) {
      return interaction.reply("❌ Cannot give yourself permissions.");
    }

    // Get user from database
    const share = await db.query.share.findFirst({
      where: and(
        eq(schema.share.userId, userId),
        eq(schema.share.serverId, server.server_id),
        eq(schema.share.accessUserId, accessUserId),
      ),
    });

    if (!share) return interaction.reply("❌ This user does not have access to this server from you!");

    // Remove from database
    await db
      .delete(schema.share)
      .where(
        and(
          eq(schema.share.userId, userId),
          eq(schema.share.serverId, server.server_id),
          eq(schema.share.accessUserId, accessUserId),
        ),
      );

    // Send message
    return interaction.reply(
      `✅ Succesfully removed <@${accessUserId}>'s access to the server with the ID \`${serverId}\`.`,
    );
  }
}

export class ShareCommand extends CommandWithSubcommands {
  name = "share";
  description = "Share server access with other users";

  subcommands = [new ShareListCommand(), new ShareInfoCommand(), new ShareAddCommand(), new ShareRemoveCommand()];
}
