import { migrate } from "drizzle-orm/mysql2/migrator";
import { db, connection } from "../src/drizzle/connectors/connection";

await migrate(db, { migrationsFolder: "drizzle/migrations" });
connection.end();
