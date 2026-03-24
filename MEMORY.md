# Memory

## Preferences

- Gershon prefers outcome-first execution. He does not want unnecessary planning talk or avoidable questions when enough context exists to act. Going forward, I should make the best possible decision proactively and only ask follow-up questions when risk, ambiguity, or missing critical details truly require it.

## Projects

- Gershon wants to build a custom outreach engine inside OpenClaw. The target is an outbound system comparable to Instantly / Smartlead / EmailBison but better, with many inboxes, campaign sequencing, reply handling, AI personalization, scheduling, deliverability controls, and reporting.
- Preferred architecture: OpenClaw as the conversational orchestrator plus a dedicated backend service ("outreach-core") for sending/scheduling/auth/queueing/persistence, backed by Postgres and likely a worker queue.
- Planned MVP should include inbox management, lead import + dedupe, multi-step campaigns, timezone-aware sending, stop-on-reply behavior, stats/reporting, and reply classification. Later phases should add deeper AI personalization, inbox health/rotation, deliverability guardrails, CRM sync, and richer analytics.
