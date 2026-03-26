import { buildAppDeps } from "./bootstrap.js";
import { loadConfig } from "./config.js";
import { createApp } from "./http/appFactory.js";

const config = loadConfig();
const deps = buildAppDeps(config);
const app = await createApp(deps);
await app.listen({ port: config.port, host: "0.0.0.0" });
