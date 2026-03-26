import type { FastifyInstance } from "fastify";

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, _request, reply) => {
    const statusCode = reply.statusCode >= 400 ? reply.statusCode : 500;
    const message = error instanceof Error ? error.message : "Unknown error";
    reply.code(statusCode).send({
      error: {
        code: statusCode === 401 ? "UNAUTHORIZED" : "INTERNAL_ERROR",
        message,
      },
    });
  });
}
