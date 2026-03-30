import { z } from "zod";
import type { FastifyInstance } from "fastify";
import { SchedulerService } from "./scheduler.js";
import { AiRuntime } from "./ai/runtime.js";
import type { Storage } from "./storage.js";
import type { JobQueue } from "./queue/types.js";
import { verifyWebhookSignature } from "./http/webhooks.js";
import { WorkerRuntime } from "./workerRuntime.js";
import { OutboundService } from "./services/outboundService.js";

function parseCsv(csv: string): Record<string, string>[] {
  const rows: string[][] = [];
  let current = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < csv.length; i += 1) {
    const char = csv[i];
    const next = csv[i + 1];
    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      row.push(current.trim());
      current = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(current.trim());
      current = "";
      if (row.some((cell) => cell.length > 0)) rows.push(row);
      row = [];
    } else {
      current += char;
    }
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current.trim());
    if (row.some((cell) => cell.length > 0)) rows.push(row);
  }

  if (rows.length === 0) return [];
  const headers = rows[0].map((item) => item.trim());
  return rows.slice(1).map((cells) => {
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header || `column_${index + 1}`] = cells[index] ?? "";
    });
    return record;
  });
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "field";
}

function renderSpintax(input: string): string {
  return input.replace(/\{([^{}]+)\}/g, (_match, group) => {
    const options = String(group).split("|").map((item) => item.trim()).filter(Boolean);
    if (options.length === 0) return "";
    return options[Math.floor(Math.random() * options.length)] ?? options[0];
  });
}

function renderTemplate(input: string, values: Record<string, unknown>) {
  return renderSpintax(input).replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_match, key) => String(values[key] ?? ""));
}

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

  app.post("/inboxes/:inboxId/connect", async (request, reply) => {
    const params = z.object({ inboxId: z.string() }).parse(request.params);
    const inbox = await storage.getInboxById(params.inboxId);
    if (!inbox) return { error: { code: "NOT_FOUND", message: "Inbox not found" } };

    try {
      const verification = await deps.outboundService.verifyInboxConnection(params.inboxId);
      inbox.authStatus = "connected";
      inbox.healthStatus = "healthy";
      inbox.lastSyncAt = verification.verifiedAt;
      await storage.updateInbox(inbox);
      reply.code(201);
      return { data: { inboxId: inbox.id, authStatus: inbox.authStatus, provider: inbox.provider, verifiedAt: verification.verifiedAt } };
    } catch (error) {
      inbox.authStatus = "expired";
      inbox.healthStatus = "degraded";
      await storage.updateInbox(inbox);
      reply.code(400);
      return {
        error: {
          code: "INBOX_CONNECT_FAILED",
          message: error instanceof Error ? error.message : "Inbox connection failed",
        },
      };
    }
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
      tags: z.array(z.string()).default([]),
    }).parse(request.body);
    reply.code(201);
    return { data: await storage.createLead(body) };
  });

  app.get("/leads", async (request) => {
    const query = z.object({ accountId: z.string() }).parse(request.query);
    return { data: await storage.listLeadsByAccountId(query.accountId) };
  });

  app.post("/lead-imports/upload", async (request, reply) => {
    const body = z.object({ accountId: z.string(), fileName: z.string(), csv: z.string().min(1) }).parse(request.body);
    const rows = parseCsv(body.csv);
    const headers = rows[0] ? Object.keys(rows[0]) : [];
    const leadImport = await storage.createLeadImport({
      accountId: body.accountId,
      fileName: body.fileName,
      status: "uploaded",
      headers,
      sampleRows: rows.slice(0, 5),
      totalRows: rows.length,
      rows,
      mapping: {},
      customFieldKeys: [],
      tagNames: [],
      createdLeadIds: [],
    });
    reply.code(201);
    return { data: leadImport };
  });

  app.get("/lead-imports", async (request) => {
    const query = z.object({ accountId: z.string() }).parse(request.query);
    return { data: await storage.listLeadImportsByAccountId(query.accountId) };
  });

  app.get("/lead-imports/:leadImportId", async (request) => {
    const params = z.object({ leadImportId: z.string() }).parse(request.params);
    const leadImport = await storage.getLeadImportById(params.leadImportId);
    if (!leadImport) return { error: { code: "NOT_FOUND", message: "Lead import not found" } };
    return { data: leadImport };
  });

  app.post("/lead-imports/:leadImportId/map", async (request) => {
    const params = z.object({ leadImportId: z.string() }).parse(request.params);
    const body = z.object({ mapping: z.record(z.string()) }).parse(request.body);
    const leadImport = await storage.getLeadImportById(params.leadImportId);
    if (!leadImport) return { error: { code: "NOT_FOUND", message: "Lead import not found" } };

    const customFieldKeys = Object.entries(body.mapping)
      .filter(([, target]) => target.startsWith("custom:"))
      .map(([, target]) => slugify(target.replace(/^custom:/, "")));
    const tagNames = Object.entries(body.mapping)
      .filter(([, target]) => target.startsWith("tag:"))
      .map(([, target]) => target.replace(/^tag:/, "").trim())
      .filter(Boolean);

    leadImport.mapping = body.mapping;
    leadImport.customFieldKeys = Array.from(new Set(customFieldKeys));
    leadImport.tagNames = Array.from(new Set(tagNames));
    leadImport.status = "mapped";
    await storage.updateLeadImport(leadImport);
    return { data: leadImport };
  });

  app.post("/lead-imports/:leadImportId/commit", async (request) => {
    const params = z.object({ leadImportId: z.string() }).parse(request.params);
    const leadImport = await storage.getLeadImportById(params.leadImportId);
    if (!leadImport) return { error: { code: "NOT_FOUND", message: "Lead import not found" } };
    if (Object.keys(leadImport.mapping).length === 0) return { error: { code: "INVALID_STATE", message: "Lead import needs a mapping first" } };

    const createdLeadIds: string[] = [];
    for (const row of leadImport.rows) {
      const customFields: Record<string, string> = {};
      const tags = new Set<string>();
      const standard: Record<string, string | undefined> = {};

      for (const [column, target] of Object.entries(leadImport.mapping)) {
        const rawValue = (row[column] ?? "").trim();
        if (!rawValue || target === "ignore") continue;
        if (target.startsWith("custom:")) {
          customFields[slugify(target.replace(/^custom:/, ""))] = rawValue;
        } else if (target.startsWith("tag:")) {
          tags.add(target.replace(/^tag:/, "").trim());
          if (["1", "true", "yes", "y"].includes(rawValue.toLowerCase())) tags.add(target.replace(/^tag:/, "").trim());
        } else {
          standard[target] = rawValue;
        }
      }

      if (!standard.email) continue;
      const lead = await storage.createLead({
        accountId: leadImport.accountId,
        email: standard.email,
        firstName: standard.firstName,
        lastName: standard.lastName,
        company: standard.company,
        title: standard.title,
        timezone: standard.timezone,
        source: standard.source ?? leadImport.fileName,
        customFields,
        tags: Array.from(tags).filter(Boolean),
      });
      createdLeadIds.push(lead.id);
    }

    leadImport.createdLeadIds = createdLeadIds;
    leadImport.status = "imported";
    await storage.updateLeadImport(leadImport);
    return { data: { leadImportId: leadImport.id, created: createdLeadIds.length, leadIds: createdLeadIds } };
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
      schedule: z.object({
        timezone: z.string().default("UTC"),
        allowedDays: z.array(z.number().int().min(0).max(6)).default([1, 2, 3, 4, 5]),
        startHour: z.number().int().min(0).max(23).default(9),
        endHour: z.number().int().min(1).max(24).default(17),
      }),
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

  app.post("/spintax/render", async (request) => {
    const body = z.object({ template: z.string(), values: z.record(z.unknown()).default({}) }).parse(request.body);
    return { data: { rendered: renderTemplate(body.template, body.values) } };
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
