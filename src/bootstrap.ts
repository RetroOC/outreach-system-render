import { InMemoryRepo } from "./repo.js";
import { InMemoryStorage } from "./inMemoryStorage.js";
import { PostgresStorage } from "./postgresStorage.js";
import { PgSqlClient } from "./postgres/client.js";
import type { Storage } from "./storage.js";
import { SchedulerService } from "./scheduler.js";
import { AiRuntime } from "./ai/runtime.js";
import { MockProviderAdapter } from "./ai/providers/mockProvider.js";
import type { ProviderName } from "./types.js";
import type { AppConfig } from "./config.js";

export type AppDeps = {
  storage: Storage;
  scheduler: SchedulerService;
  aiRuntime: AiRuntime;
};

export function buildAppDeps(config: AppConfig): AppDeps {
  const storage: Storage = config.databaseUrl
    ? new PostgresStorage(new PgSqlClient(config.databaseUrl))
    : new InMemoryStorage(new InMemoryRepo());

  const providers = new Map<ProviderName, MockProviderAdapter>([
    ["openai", new MockProviderAdapter("openai")],
    ["anthropic", new MockProviderAdapter("anthropic")],
    ["deepseek", new MockProviderAdapter("deepseek")],
    ["gemini", new MockProviderAdapter("gemini")],
    ["local", new MockProviderAdapter("local")],
  ]);

  const aiRuntime = new AiRuntime(providers);
  const scheduler = new SchedulerService(storage);

  return { storage, scheduler, aiRuntime };
}
