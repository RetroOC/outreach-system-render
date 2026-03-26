import Fastify from "fastify";
import { InMemoryRepo } from "./repo.js";
import { SchedulerService } from "./scheduler.js";
import { registerRoutes } from "./routes.js";
import { AiRuntime } from "./ai/runtime.js";
import { MockProviderAdapter } from "./ai/providers/mockProvider.js";
import type { ProviderName } from "./types.js";

const app = Fastify({ logger: true });
const repo = new InMemoryRepo();
const scheduler = new SchedulerService(repo);
const providers = new Map<ProviderName, MockProviderAdapter>([
  ["openai", new MockProviderAdapter("openai")],
  ["anthropic", new MockProviderAdapter("anthropic")],
  ["deepseek", new MockProviderAdapter("deepseek")],
  ["gemini", new MockProviderAdapter("gemini")],
  ["local", new MockProviderAdapter("local")],
]);
const aiRuntime = new AiRuntime(providers);

await registerRoutes(app, { repo, scheduler, aiRuntime });

const port = Number(process.env.PORT ?? 3000);
await app.listen({ port, host: "0.0.0.0" });
