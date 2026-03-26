import test from "node:test";
import assert from "node:assert/strict";
import { buildAppDeps } from "../bootstrap.js";
import { createApp } from "./appFactory.js";

test("idempotency returns cached response for repeated POST", async () => {
  const app = await createApp(buildAppDeps({ port: 0, databaseUrl: undefined, apiKey: undefined, webhookSecret: undefined }));

  const payload = { name: "Acme", settings: {} };
  const headers = { "idempotency-key": "same-key" };

  const first = await app.inject({ method: "POST", url: "/accounts", headers, payload });
  const second = await app.inject({ method: "POST", url: "/accounts", headers, payload });

  assert.equal(first.statusCode, 201);
  assert.equal(second.statusCode, 201);
  assert.equal(first.body, second.body);
  await app.close();
});
