import { bigint, varchar, date, mysqlTable } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  userId: bigint("user_id", { mode: "bigint" }).notNull().primaryKey(),
  modrinthAuth: varchar("modrinth_auth", { length: 126 }).notNull(),
  modrinthExpires: date("modrinth_expires").notNull(),
  modrinthRefreshExpires: date("modrinth_refresh_expires").notNull(),
});
