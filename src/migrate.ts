import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadConfig } from "./config.js";
import { PgSqlClient } from "./postgres/client.js";

const config = loadConfig();

if (!config.databaseUrl) {
  console.error("DATABASE_URL is required to run migrations");
  process.exit(1);
}

const client = new PgSqlClient(config.databaseUrl);
const schema = readFileSync(resolve(process.cwd(), "db/schema.sql"), "utf8");
await client.query({ text: schema });
console.log("Applied db/schema.sql");
await client.close();
