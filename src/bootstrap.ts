import { InMemoryRepo } from "./repo.js";
import { InMemoryStorage } from "./inMemoryStorage.js";
import { PostgresStorage } from "./postgresStorage.js";
import { PgSqlClient } from "./postgres/client.js";
import type { Storage } from "./storage.js";
import { SchedulerService } from "./scheduler.js";
import { AiRuntime } from "./ai/runtime.js";
import type { ProviderName } from "./types.js";
import type { AppConfig } from "./config.js";
import type { JobQueue } from "./queue/types.js";
import { InMemoryJobQueue } from "./queue/inMemoryQueue.js";
import { PostgresJobQueue } from "./queue/postgresQueue.js";
import { OutboundService } from "./services/outboundService.js";
import { WorkerRuntime } from "./workerRuntime.js";
import { buildAiProviderRegistry } from "./ai/providers/providerRegistry.js";
import { EmailProviderRegistry } from "./providers/email/providerRegistry.js";

export type AppDeps = {
  storage: Storage;
  scheduler: SchedulerService;
  aiRuntime: AiRuntime;
  queue: JobQueue;
  outboundService: OutboundService;
  workerRuntime: WorkerRuntime;
};

export function buildAppDeps(config: AppConfig): AppDeps {
  const sqlClient = config.databaseUrl ? new PgSqlClient(config.databaseUrl) : null;
  const storage: Storage = sqlClient
    ? new PostgresStorage(sqlClient)
    : new InMemoryStorage(new InMemoryRepo());

  const providers = buildAiProviderRegistry();
  const emailProviders = new EmailProviderRegistry();

  const aiRuntime = new AiRuntime(providers as Map<ProviderName, any>);
  const scheduler = new SchedulerService(storage);
  const queue: JobQueue = sqlClient ? new PostgresJobQueue(sqlClient) : new InMemoryJobQueue();
  const outboundService = new OutboundService(storage, emailProviders.getDefault());
  const workerRuntime = new WorkerRuntime(queue, scheduler, outboundService);

  return { storage, scheduler, aiRuntime, queue, outboundService, workerRuntime };
}
