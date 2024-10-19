import env from "../../env";
import schema from "../main/schema";
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";

export const pool = mysql.createPool({
  host: env.DATABASE_HOST,
  port: env.DATABASE_PORT,
  user: env.DATABASE_USER,
  password: env.DATABASE_PASSWORD,
  database: env.DATABASE_NAME,
  waitForConnections: true,
  supportBigNumbers: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const db = drizzle(pool, { mode: "default", schema });
