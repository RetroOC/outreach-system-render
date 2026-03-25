# Memory

## Preferences

- Gershon prefers outcome-first execution. He does not want unnecessary planning talk or avoidable questions when enough context exists to act. Going forward, I should make the best possible decision proactively and only ask follow-up questions when risk, ambiguity, or missing critical details truly require it.

## Projects

- Tanzalfa.com is a project focused on selling real estate/property ranches in Tanzania to UHNIs. Gershon wants me to help grow it, not just track it.
- Current Tanzalfa direction: position it as a premium, discreet, high-trust land/ranch acquisition platform for wealthy buyers, not a generic listings portal. The strongest framing is a curated buyer-side access/advisory experience for high-value Tanzanian land opportunities.
- Website direction for Tanzalfa: premium look and feel, trust-heavy, elegant, restrained, investor-grade, and focused on confidence, diligence, curation, and white-glove experience rather than volume listings.
- Likely key pages for Tanzalfa: Home, About / Why Tanzania, Investment Thesis, Curated Opportunities, Buyer Services, Due Diligence / Trust & Process, Contact / Private Consultation.
- Neal should be able to generate the website copy for Tanzalfa in this premium style.
- Gershon wants to build a custom outreach engine inside OpenClaw. The target is an outbound system comparable to Instantly / Smartlead / EmailBison but better, with many inboxes, campaign sequencing, reply handling, AI personalization, scheduling, deliverability controls, and reporting.
- Preferred architecture: OpenClaw as the conversational orchestrator plus a dedicated backend service ("outreach-core") for sending/scheduling/auth/queueing/persistence, backed by Postgres and likely a worker queue.
- Planned MVP should include inbox management, lead import + dedupe, multi-step campaigns, timezone-aware sending, stop-on-reply behavior, stats/reporting, and reply classification. Later phases should add deeper AI personalization, inbox health/rotation, deliverability guardrails, CRM sync, and richer analytics.
