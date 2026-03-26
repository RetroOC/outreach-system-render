import Fastify from "fastify";
import { registerRoutes } from "./routes.js";
import { buildAppDeps } from "./bootstrap.js";
import { loadConfig } from "./config.js";

const config = loadConfig();
const app = Fastify({ logger: true });
const deps = buildAppDeps(config);

await registerRoutes(app, deps);
await app.listen({ port: config.port, host: "0.0.0.0" });
