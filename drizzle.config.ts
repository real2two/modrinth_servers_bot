import env from "./src/env";

export default {
  dialect: "mysql",
  schema: "./src/drizzle/schema/**/*",
  out: "./drizzle/migrations",
  dbCredentials: {
    host: env.DATABASE_HOST,
    port: env.DATABASE_PORT,
    user: env.DATABASE_USER,
    password: env.DATABASE_PASSWORD,
    database: env.DATABASE_NAME,
  },
};
