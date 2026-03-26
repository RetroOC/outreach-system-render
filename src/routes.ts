import { z } from "zod";
import type { FastifyInstance } from "fastify";
import { InMemoryRepo } from "./repo.js";
import { SchedulerService } from "./scheduler.js";
import { AiRuntime } from "./ai/runtime.js";

export async function registerRoutes(app: FastifyInstance, deps: { repo: InMemoryRepo; scheduler: SchedulerService; aiRuntime: AiRuntime }) {
  const { repo, scheduler, aiRuntime } = deps;

  app.get("/health", async () => ({ ok: true }));

  app.post("/accounts", async (request, reply) => {
    const body = z.object({ name: z.string(), settings: z.record(z.unknown()).default({}) }).parse(request.body);
    reply.code(201);
    return { data: repo.createAccount(body) };
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
    return { data: repo.createInbox(body) };
  });

  app.post("/inboxes/:inboxId/connect", async (request) => {
    const params = z.object({ inboxId: z.string() }).parse(request.params);
    const inbox = repo.inboxes.get(params.inboxId);
    if (!inbox) return { error: { code: "NOT_FOUND", message: "Inbox not found" } };
    inbox.authStatus = "connected";
    repo.inboxes.set(inbox.id, inbox);
    return { data: { inboxId: inbox.id, authStatus: inbox.authStatus } };
  });

  app.get("/inboxes/:inboxId/health", async (request) => {
    const params = z.object({ inboxId: z.string() }).parse(request.params);
    const inbox = repo.inboxes.get(params.inboxId);
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
    return { data: repo.createLead(body) };
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
    return { data: repo.createCampaign(body) };
  });

  app.post("/campaigns/:campaignId/start", async (request) => {
    const params = z.object({ campaignId: z.string() }).parse(request.params);
    const campaign = repo.campaigns.get(params.campaignId);
    if (!campaign) return { error: { code: "NOT_FOUND", message: "Campaign not found" } };
    campaign.status = "active";
    repo.campaigns.set(campaign.id, campaign);
    return { data: campaign };
  });

  app.post("/campaigns/:campaignId/enrollments", async (request, reply) => {
    const params = z.object({ campaignId: z.string() }).parse(request.params);
    const body = z.object({ leadIds: z.array(z.string()).min(1), inboxId: z.string() }).parse(request.body);
    const campaign = repo.campaigns.get(params.campaignId);
    if (!campaign) return { error: { code: "NOT_FOUND", message: "Campaign not found" } };
    const created = body.leadIds.map((leadId) => {
      const enrollment = repo.createEnrollment({
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
      scheduler.scheduleFirstStep(enrollment);
      repo.createThread({
        enrollmentId: enrollment.id,
        leadId,
        inboxId: body.inboxId,
        state: "open",
        lastMessageAt: new Date().toISOString(),
      });
      return enrollment;
    });
    reply.code(201);
    return { data: { campaignId: campaign.id, created: created.length, enrollmentIds: created.map((item) => item.id) } };
  });

  app.get("/enrollments/:enrollmentId", async (request) => {
    const params = z.object({ enrollmentId: z.string() }).parse(request.params);
    const enrollment = repo.enrollments.get(params.enrollmentId);
    if (!enrollment) return { error: { code: "NOT_FOUND", message: "Enrollment not found" } };
    return { data: enrollment };
  });

  app.post("/ops/scheduler/run", async () => ({ data: scheduler.runDue() }));

  app.post("/messages/:messageId/classify", async (request) => {
    const params = z.object({ messageId: z.string() }).parse(request.params);
    const message = repo.messages.get(params.messageId);
    if (!message) return { error: { code: "NOT_FOUND", message: "Message not found" } };
    const result = await aiRuntime.runStructuredTask("reply_classification", {
      subject: message.subject,
      bodyText: message.bodyText,
      threadHistory: [],
    });
    if (result.ok) {
      message.classification = result.data as Record<string, unknown>;
      repo.messages.set(message.id, message);
    }
    return { data: result };
  });

  app.post("/threads/:threadId/draft-reply", async (request) => {
    const params = z.object({ threadId: z.string() }).parse(request.params);
    const body = z.object({ tone: z.string().optional(), goal: z.string().default("book_call") }).parse(request.body);
    const thread = repo.threads.get(params.threadId);
    if (!thread) return { error: { code: "NOT_FOUND", message: "Thread not found" } };
    const lead = repo.leads.get(thread.leadId);
    const result = await aiRuntime.runGenerationTask("reply_draft", {
      leadName: lead?.firstName ?? "there",
      company: lead?.company ?? "your company",
      priorThread: Array.from(repo.messages.values()).filter((m) => m.threadId === thread.id).map((m) => `${m.direction}: ${m.bodyText}`),
      goal: body.goal,
      tone: body.tone,
    });
    return { data: result };
  });
}
