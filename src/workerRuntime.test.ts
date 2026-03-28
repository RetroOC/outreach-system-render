import test from "node:test";
import assert from "node:assert/strict";
import { InMemoryRepo } from "./repo.js";
import { InMemoryStorage } from "./inMemoryStorage.js";
import { SchedulerService } from "./scheduler.js";
import { InMemoryJobQueue } from "./queue/inMemoryQueue.js";
import { OutboundService } from "./services/outboundService.js";
import { WorkerRuntime } from "./workerRuntime.js";
import { EmailProviderRegistry } from "./providers/email/providerRegistry.js";

test("worker runtime schedules and processes outbound message", async () => {
  const repo = new InMemoryRepo();
  const storage = new InMemoryStorage(repo);
  const scheduler = new SchedulerService(storage);
  const queue = new InMemoryJobQueue();
  const outbound = new OutboundService(storage, new EmailProviderRegistry());
  const worker = new WorkerRuntime(queue, scheduler, outbound);

  const account = await storage.createAccount({ name: "Test", settings: {} });
  const inbox = await storage.createInbox({
    accountId: account.id,
    emailAddress: "test@example.com",
    provider: "mock-email",
    dailyLimit: 50,
    hourlyLimit: 10,
    minDelaySeconds: 0,
    sendingWindow: {},
  });
  inbox.authStatus = "connected";
  await storage.updateInbox(inbox);
  const lead = await storage.createLead({ accountId: account.id, email: "lead@example.com", firstName: "Jane", company: "Acme", customFields: {} });
  const campaign = await storage.createCampaign({
    accountId: account.id,
    name: "Test Campaign",
    status: "active",
    settings: {},
    steps: [{ stepNumber: 1, type: "email", delay: { kind: "after_enrollment", amount: 0, unit: "minutes" }, subjectTemplate: "Hi {{first_name}}", bodyTemplate: "Hello {{company}}" }],
  });
  const enrollment = await storage.createEnrollment({
    campaignId: campaign.id,
    leadId: lead.id,
    assignedInboxId: inbox.id,
    state: "active",
    currentStepIndex: 0,
    nextActionAt: new Date(Date.now() - 1000).toISOString(),
    lastOutboundSentAt: null,
    lastInboundReceivedAt: null,
    stopReason: null,
  });

  const result = await worker.tick();
  assert.equal(result.queued.length, 1);

  const thread = await storage.findThreadByEnrollmentId(enrollment.id);
  assert.ok(thread);
  const messages = await storage.listMessagesByThreadId(thread!.id);
  assert.equal(messages.length, 1);
  assert.equal(messages[0].direction, "outbound");

  const updatedEnrollment = await storage.getEnrollmentById(enrollment.id);
  assert.equal(updatedEnrollment?.state, "completed");
});
