import Fastify from "fastify";
import { registerRoutes } from "../routes.js";
import { requireApiKey } from "./auth.js";
import { registerIdempotency } from "./idempotency.js";
import { registerErrorHandler } from "./errors.js";
import type { AppDeps } from "../bootstrap.js";

export async function createApp(deps: AppDeps) {
  const app = Fastify({ logger: false });

  app.addHook("onRequest", async (request, reply) => {
    reply.header("access-control-allow-origin", "*");
    reply.header("access-control-allow-methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    reply.header("access-control-allow-headers", "content-type, authorization, idempotency-key");

    if (request.method === "OPTIONS") {
      reply.code(204);
      return reply.send();
    }
  });

  registerIdempotency(app);
  registerErrorHandler(app);
  app.addHook("preHandler", requireApiKey);
  await registerRoutes(app, deps);
  return app;
}
