# outreach-core

Initial MVP backend scaffold for the outreach system.

## What is included

- Fastify REST API scaffold
- in-memory repository for rapid iteration
- concrete Postgres schema in `db/schema.sql`
- first Postgres repository layer in `src/postgres/`
- campaign / lead / inbox / enrollment resources
- scheduler skeleton for due enrollment processing
- provider-agnostic `ai-runtime`
- mock adapters for OpenAI, Anthropic, DeepSeek, Gemini, and local models

## Current limitations

This is intentionally the first working backend slice, not the finished production system.

- Postgres schema and storage layer exist, but migrations/runtime wiring still need hardening and real deployment setup
- no real inbox provider auth yet
- no real email sending yet
- worker exists as a polling skeleton, not a full queue-backed execution system yet
- AI adapters are mocked to prove architecture and interfaces

## Run

```bash
npm install
npm run dev
```

### With Postgres

1. create a database
2. set `DATABASE_URL`
3. run migrations
4. run the API and worker

```bash
npm run migrate
npm run dev
npm run dev:worker
```

## Next build steps

1. add real provider adapters for LLMs
2. add Gmail / Graph / SMTP connectors
3. add deeper reply ingestion and provider normalization
4. add integration tests and deployment packaging
5. add stronger audit logs and observability
