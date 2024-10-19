import { bigint, varchar, mysqlTable } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  userId: bigint("user_id", { mode: "bigint" }).notNull().primaryKey(),
  modrinthPat: varchar("modrinth_pat", { length: 126 }).notNull(),
});
