import Fastify from "fastify";
import { registerRoutes } from "./routes.js";
import { buildAppDeps } from "./bootstrap.js";
import { loadConfig } from "./config.js";
import { requireApiKey } from "./http/auth.js";
import { registerIdempotency } from "./http/idempotency.js";
import { registerErrorHandler } from "./http/errors.js";

const config = loadConfig();
const app = Fastify({ logger: true });
const deps = buildAppDeps(config);

registerIdempotency(app);
registerErrorHandler(app);
app.addHook("preHandler", requireApiKey);

await registerRoutes(app, deps);
await app.listen({ port: config.port, host: "0.0.0.0" });
