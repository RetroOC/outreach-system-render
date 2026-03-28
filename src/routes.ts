import { z } from "zod";
import type { FastifyInstance } from "fastify";
import { SchedulerService } from "./scheduler.js";
import { AiRuntime } from "./ai/runtime.js";
import type { Storage } from "./storage.js";
import type { JobQueue } from "./queue/types.js";
import { verifyWebhookSignature } from "./http/webhooks.js";
import { WorkerRuntime } from "./workerRuntime.js";
import { OutboundService } from "./services/outboundService.js";

export async function registerRoutes(app: FastifyInstance, deps: { storage: Storage; scheduler: SchedulerService; aiRuntime: AiRuntime; queue: JobQueue; workerRuntime: WorkerRuntime; outboundService: OutboundService }) {
  const { storage, scheduler, aiRuntime, queue } = deps;

  app.get("/health", async () => ({ ok: true }));

  app.post("/accounts", async (request, reply) => {
    const body = z.object({ name: z.string(), settings: z.record(z.unknown()).default({}) }).parse(request.body);
    reply.code(201);
    return { data: await storage.createAccount(body) };
  });

  app.post("/inboxes", async (request, reply) => {
    const body = z.object({
      accountId: z.string(),
      emailAddress: z.string().email(),
      provider: z.string(),
      displayName: z.string().optional(),
      dailyLimit: z.number().int().positive(),
      hourlyLimit: z.number().int().positive(),
      minDelaySeconds: z.number().int().nonnegative(),
      sendingWindow: z.record(z.unknown()).default({}),
    }).parse(request.body);
    reply.code(201);
    return { data: await storage.createInbox(body) };
  });

  app.post("/inboxes/:inboxId/connect", async (request) => {
    const params = z.object({ inboxId: z.string() }).parse(request.params);
    const inbox = await storage.getInboxById(params.inboxId);
    if (!inbox) return { error: { code: "NOT_FOUND", message: "Inbox not found" } };
    inbox.authStatus = "connected";
    await storage.updateInbox(inbox);
    return { data: { inboxId: inbox.id, authStatus: inbox.authStatus } };
  });

  app.post("/inboxes/:inboxId/send-test", async (request, reply) => {
    const params = z.object({ inboxId: z.string() }).parse(request.params);
    const body = z.object({ to: z.string().email(), subject: z.string(), text: z.string(), html: z.string().optional() }).parse(request.body);
    const inbox = await storage.getInboxById(params.inboxId);
    if (!inbox) return { error: { code: "NOT_FOUND", message: "Inbox not found" } };
    const result = await deps.outboundService.sendTestEmail({ inboxId: params.inboxId, ...body });
    reply.code(201);
    return { data: result };
  });

  app.get("/inboxes/:inboxId/health", async (request) => {
    const params = z.object({ inboxId: z.string() }).parse(request.params);
    const inbox = await storage.getInboxById(params.inboxId);
    if (!inbox) return { error: { code: "NOT_FOUND", message: "Inbox not found" } };
    return { data: { ...inbox, remainingToday: inbox.dailyLimit - inbox.sentToday - inbox.reservedToday } };
  });

  app.post("/leads", async (request, reply) => {
    const body = z.object({
      accountId: z.string(),
      email: z.string().email(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      company: z.string().optional(),
      title: z.string().optional(),
      timezone: z.string().optional(),
      source: z.string().optional(),
      customFields: z.record(z.unknown()).default({}),
    }).parse(request.body);
    reply.code(201);
    return { data: await storage.createLead(body) };
  });

  app.post("/campaigns", async (request, reply) => {
    const stepSchema = z.object({
      stepNumber: z.number().int().positive(),
      type: z.literal("email"),
      delay: z.object({ kind: z.enum(["after_enrollment", "after_previous_sent"]), amount: z.number().int().nonnegative(), unit: z.enum(["minutes", "hours", "days"]) }),
      subjectTemplate: z.string(),
      bodyTemplate: z.string(),
    });
    const body = z.object({
      accountId: z.string(),
      name: z.string(),
      status: z.enum(["draft", "active", "paused", "archived"]).default("draft"),
      objective: z.string().optional(),
      settings: z.record(z.unknown()).default({}),
      steps: z.array(stepSchema).min(1),
    }).parse(request.body);
    reply.code(201);
    return { data: await storage.createCampaign(body) };
  });

  app.post("/campaigns/:campaignId/start", async (request) => {
    const params = z.object({ campaignId: z.string() }).parse(request.params);
    const campaign = await storage.getCampaignById(params.campaignId);
    if (!campaign) return { error: { code: "NOT_FOUND", message: "Campaign not found" } };
    campaign.status = "active";
    await storage.updateCampaign(campaign);
    return { data: campaign };
  });

  app.post("/campaigns/:campaignId/enrollments", async (request, reply) => {
    const params = z.object({ campaignId: z.string() }).parse(request.params);
    const body = z.object({ leadIds: z.array(z.string()).min(1), inboxId: z.string() }).parse(request.body);
    const campaign = await storage.getCampaignById(params.campaignId);
    if (!campaign) return { error: { code: "NOT_FOUND", message: "Campaign not found" } };
    const created: string[] = [];

    for (const leadId of body.leadIds) {
      const enrollment = await storage.createEnrollment({
        campaignId: campaign.id,
        leadId,
        assignedInboxId: body.inboxId,
        state: "active",
        currentStepIndex: 0,
        nextActionAt: new Date().toISOString(),
        lastOutboundSentAt: null,
        lastInboundReceivedAt: null,
        stopReason: null,
      });
      await scheduler.scheduleFirstStep(enrollment);
      await storage.createThread({
        enrollmentId: enrollment.id,
        leadId,
        inboxId: body.inboxId,
        state: "open",
        lastMessageAt: new Date().toISOString(),
      });
      created.push(enrollment.id);
    }

    reply.code(201);
    return { data: { campaignId: campaign.id, created: created.length, enrollmentIds: created } };
  });

  app.get("/enrollments/:enrollmentId", async (request) => {
    const params = z.object({ enrollmentId: z.string() }).parse(request.params);
    const enrollment = await storage.getEnrollmentById(params.enrollmentId);
    if (!enrollment) return { error: { code: "NOT_FOUND", message: "Enrollment not found" } };
    return { data: enrollment };
  });

  app.post("/ops/scheduler/run", async () => ({ data: await scheduler.runDue() }));
  app.post("/ops/worker/tick", async () => ({ data: await deps.workerRuntime.tick() }));

  app.post("/ops/jobs/enqueue", async (request, reply) => {
    const body = z.object({ kind: z.string(), payload: z.record(z.unknown()).default({}), availableAt: z.string().optional(), maxAttempts: z.number().int().positive().optional() }).parse(request.body);
    reply.code(201);
    return { data: await queue.enqueue(body) };
  });

  app.post("/messages/:messageId/classify", async (request) => {
    const params = z.object({ messageId: z.string() }).parse(request.params);
    const message = await storage.getMessageById(params.messageId);
    if (!message) return { error: { code: "NOT_FOUND", message: "Message not found" } };
    const result = await aiRuntime.runStructuredTask("reply_classification", {
      subject: message.subject,
      bodyText: message.bodyText,
      threadHistory: [],
    });
    if (result.ok) {
      message.classification = result.data as Record<string, unknown>;
      await storage.updateMessage(message);
      const classification = result.data as Record<string, unknown>;
      if (classification.label === "unsubscribe") {
        const thread = await storage.getThreadById(message.threadId);
        const lead = thread ? await storage.getLeadById(thread.leadId) : null;
        if (lead) {
          await storage.createSuppression({
            accountId: lead.accountId,
            email: lead.email,
            reason: "unsubscribe",
          });
        }
      }
    }
    return { data: result };
  });

  app.post("/threads/:threadId/draft-reply", async (request) => {
    const params = z.object({ threadId: z.string() }).parse(request.params);
    const body = z.object({ tone: z.string().optional(), goal: z.string().default("book_call") }).parse(request.body);
    const thread = await storage.getThreadById(params.threadId);
    if (!thread) return { error: { code: "NOT_FOUND", message: "Thread not found" } };
    const lead = await storage.getLeadById(thread.leadId);
    const messages = await storage.listMessagesByThreadId(thread.id);
    const result = await aiRuntime.runGenerationTask("reply_draft", {
      leadName: lead?.firstName ?? "there",
      company: lead?.company ?? "your company",
      priorThread: messages.map((m) => `${m.direction}: ${m.bodyText}`),
      goal: body.goal,
      tone: body.tone,
    });
    return { data: result };
  });

  app.post("/suppressions", async (request, reply) => {
    const body = z.object({ accountId: z.string(), email: z.string().email(), reason: z.string() }).parse(request.body);
    reply.code(201);
    return { data: await storage.createSuppression(body) };
  });

  app.get("/campaigns", async (request) => {
    const query = z.object({ accountId: z.string() }).parse(request.query);
    return { data: await storage.listCampaignsByAccountId(query.accountId) };
  });

  app.get("/campaigns/:campaignId/stats", async (request) => {
    const params = z.object({ campaignId: z.string() }).parse(request.params);
    const enrollments = await storage.listEnrollmentsByCampaignId(params.campaignId);
    const totals = {
      enrolled: enrollments.length,
      active: enrollments.filter((item) => item.state === "active").length,
      completed: enrollments.filter((item) => item.state === "completed").length,
      replied: enrollments.filter((item) => item.state === "replied").length,
      bounced: enrollments.filter((item) => item.state === "bounced").length,
      unsubscribed: enrollments.filter((item) => item.state === "unsubscribed").length,
      failed: enrollments.filter((item) => item.state === "failed").length,
    };
    return { data: { campaignId: params.campaignId, ...totals } };
  });

  app.post("/webhooks/providers/:provider", async (request, reply) => {
    const params = z.object({ provider: z.string() }).parse(request.params);
    const rawBody = typeof request.body === "string" ? request.body : JSON.stringify(request.body ?? {});
    const signature = request.headers["x-signature"];
    const secret = process.env.WEBHOOK_SECRET;
    if (!verifyWebhookSignature(rawBody, typeof signature === "string" ? signature : undefined, secret)) {
      reply.code(401);
      return { error: { code: "WEBHOOK_SIGNATURE_INVALID", message: "Invalid webhook signature" } };
    }

    const payload = z.object({
      threadId: z.string().optional(),
      enrollmentId: z.string().optional(),
      subject: z.string().optional(),
      bodyText: z.string().optional(),
      providerMessageId: z.string().optional(),
    }).passthrough().parse(typeof request.body === "object" && request.body ? request.body : {});

    if (payload.threadId && payload.enrollmentId && payload.subject && payload.bodyText) {
      await queue.enqueue({
        kind: "ingest_inbound_message",
        payload: {
          threadId: payload.threadId,
          enrollmentId: payload.enrollmentId,
          subject: payload.subject,
          bodyText: payload.bodyText,
          providerMessageId: payload.providerMessageId,
          provider: params.provider,
        },
      });
    }

    return { data: { accepted: true, provider: params.provider, receivedAt: new Date().toISOString() } };
  });
}
