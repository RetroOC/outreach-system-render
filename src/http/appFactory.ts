import Fastify from "fastify";
import { registerRoutes } from "../routes.js";
import { requireApiKey } from "./auth.js";
import { registerIdempotency } from "./idempotency.js";
import { registerErrorHandler } from "./errors.js";
import type { AppDeps } from "../bootstrap.js";

export async function createApp(deps: AppDeps) {
  const app = Fastify({ logger: false });
  registerIdempotency(app);
  registerErrorHandler(app);
  app.addHook("preHandler", requireApiKey);
  await registerRoutes(app, deps);
  return app;
}
