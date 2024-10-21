import { boolean, bigint, varchar, primaryKey, mysqlTable } from "drizzle-orm/mysql-core";

export const share = mysqlTable(
  "share",
  {
    userId: bigint("user_id", { mode: "bigint" }).notNull(),
    serverId: varchar("server_id", { length: 126 }).notNull(),
    accessUserId: bigint("access_user_id", { mode: "bigint" }).notNull(),

    canSendCommands: boolean("can_send_commands").notNull().default(false),
    canStartServer: boolean("can_start_server").notNull().default(false),
    canRestartServer: boolean("can_restart_server").notNull().default(false),
    canStopServer: boolean("can_stop_server").notNull().default(false),
    canKillServer: boolean("can_kill_server").notNull().default(false),
  },
  (table) => ({
    pk: primaryKey({
      name: "characters_pk",
      columns: [table.userId, table.accessUserId],
    }),
  }),
);
