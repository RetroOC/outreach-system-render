import type { FastifyReply, FastifyRequest } from "fastify";

export async function requireApiKey(request: FastifyRequest, reply: FastifyReply) {
  if (request.url === "/health") return;

  const configured = process.env.API_KEY;
  if (!configured) return;

  const auth = request.headers.authorization;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : undefined;

  if (token !== configured) {
    reply.code(401);
    throw new Error("Unauthorized");
  }
}
