import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

type CacheEntry = {
  statusCode: number;
  payload: unknown;
};

const cache = new Map<string, CacheEntry>();

export function registerIdempotency(app: FastifyInstance) {
  app.addHook("preHandler", async (request: FastifyRequest, reply: FastifyReply) => {
    if (request.method !== "POST") return;
    const key = request.headers["idempotency-key"];
    if (typeof key !== "string" || key.length === 0) return;
    const cacheKey = `${request.method}:${request.url}:${key}`;
    const existing = cache.get(cacheKey);
    if (existing) {
      reply.code(existing.statusCode);
      return reply.send(existing.payload);
    }
    (request as FastifyRequest & { idempotencyCacheKey?: string }).idempotencyCacheKey = cacheKey;
  });

  app.addHook("onSend", async (request, reply, payload) => {
    const cacheKey = (request as FastifyRequest & { idempotencyCacheKey?: string }).idempotencyCacheKey;
    if (!cacheKey) return payload;
    let parsed: unknown = payload;
    if (typeof payload === "string") {
      try {
        parsed = JSON.parse(payload);
      } catch {
        parsed = payload;
      }
    }
    cache.set(cacheKey, { statusCode: reply.statusCode, payload: parsed });
    return payload;
  });
}
