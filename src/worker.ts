import { buildAppDeps } from "./bootstrap.js";
import { loadConfig } from "./config.js";

const config = loadConfig();
const { workerRuntime } = buildAppDeps(config);

const intervalMs = Number(process.env.WORKER_INTERVAL_MS ?? 15000);

async function tick() {
  const result = await workerRuntime.tick();
  if (result.queued.length > 0 || result.processed) {
    console.log(JSON.stringify({ type: "worker_tick", ...result }));
  }
}

await tick();
setInterval(() => {
  void tick();
}, intervalMs);
