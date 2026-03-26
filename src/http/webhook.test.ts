import test from "node:test";
import assert from "node:assert/strict";
import { buildAppDeps } from "../bootstrap.js";
import { createApp } from "./appFactory.js";

test("webhook rejects invalid signature when secret is configured", async () => {
  process.env.WEBHOOK_SECRET = "secret123";
  const app = await createApp(buildAppDeps({ port: 0, databaseUrl: undefined, apiKey: undefined, webhookSecret: "secret123" }));

  const response = await app.inject({
    method: "POST",
    url: "/webhooks/providers/mock-email",
    headers: { "x-signature": "bad" },
    payload: { threadId: "thr_1", enrollmentId: "enr_1", subject: "Hi", bodyText: "Reply" },
  });

  assert.equal(response.statusCode, 401);
  await app.close();
  delete process.env.WEBHOOK_SECRET;
});
