import { z } from "zod";
import type { AiTaskName, CostTier, ProviderName, QualityTier } from "../types.js";

export const ReplyClassificationOutputSchema = z.object({
  label: z.enum(["positive", "neutral", "negative", "unsubscribe", "out_of_office", "not_human"]),
  confidence: z.number().min(0).max(1),
  signals: z.array(z.string()),
  suggestedAction: z.enum(["stop", "pause", "continue", "manual_review"]),
});

export const UnsubscribeDetectionOutputSchema = z.object({
  isUnsubscribe: z.boolean(),
  confidence: z.number().min(0).max(1),
  reason: z.string(),
});

export const OutOfOfficeDetectionOutputSchema = z.object({
  isOutOfOffice: z.boolean(),
  confidence: z.number().min(0).max(1),
  returnDate: z.string().nullable(),
});

const ReplyInputSchema = z.object({
  subject: z.string().default(""),
  bodyText: z.string(),
  threadHistory: z.array(z.string()).default([]),
});

const DraftInputSchema = z.object({
  leadName: z.string(),
  company: z.string(),
  priorThread: z.array(z.string()).default([]),
  goal: z.string(),
});

const PersonalizationInputSchema = z.object({
  leadName: z.string().optional(),
  company: z.string(),
  websiteSummary: z.string().optional(),
  angle: z.string(),
});

export type TaskDefinition = {
  name: AiTaskName;
  kind: "structured" | "generation";
  promptVersion: string;
  schemaVersion?: string;
  inputSchema: z.ZodTypeAny;
  outputSchema?: z.ZodTypeAny;
  defaultPolicy: {
    qualityTier: QualityTier;
    costTier: CostTier;
    preferredProviders: ProviderName[];
    fallbackChain: ProviderName[];
    minConfidence?: number;
    timeoutMs: number;
  };
  renderPrompt: (input: unknown) => string;
};

export const TASKS: Record<AiTaskName, TaskDefinition> = {
  reply_classification: {
    name: "reply_classification",
    kind: "structured",
    promptVersion: "v1",
    schemaVersion: "v1",
    inputSchema: ReplyInputSchema,
    outputSchema: ReplyClassificationOutputSchema,
    defaultPolicy: {
      qualityTier: "medium",
      costTier: "low",
      preferredProviders: ["deepseek", "openai", "anthropic"],
      fallbackChain: ["openai", "anthropic"],
      minConfidence: 0.85,
      timeoutMs: 6000,
    },
    renderPrompt: (input) => {
      const parsed = ReplyInputSchema.parse(input);
      return `Classify the reply. Subject: ${parsed.subject}\nBody: ${parsed.bodyText}\nHistory: ${parsed.threadHistory.join("\n")}`;
    },
  },
  unsubscribe_detection: {
    name: "unsubscribe_detection",
    kind: "structured",
    promptVersion: "v1",
    schemaVersion: "v1",
    inputSchema: ReplyInputSchema,
    outputSchema: UnsubscribeDetectionOutputSchema,
    defaultPolicy: {
      qualityTier: "high",
      costTier: "balanced",
      preferredProviders: ["openai", "anthropic"],
      fallbackChain: ["anthropic", "deepseek"],
      minConfidence: 0.9,
      timeoutMs: 6000,
    },
    renderPrompt: (input) => {
      const parsed = ReplyInputSchema.parse(input);
      return `Detect whether this message is an unsubscribe request. Subject: ${parsed.subject}\nBody: ${parsed.bodyText}`;
    },
  },
  out_of_office_detection: {
    name: "out_of_office_detection",
    kind: "structured",
    promptVersion: "v1",
    schemaVersion: "v1",
    inputSchema: ReplyInputSchema,
    outputSchema: OutOfOfficeDetectionOutputSchema,
    defaultPolicy: {
      qualityTier: "medium",
      costTier: "low",
      preferredProviders: ["deepseek", "openai", "anthropic"],
      fallbackChain: ["openai", "anthropic"],
      minConfidence: 0.8,
      timeoutMs: 6000,
    },
    renderPrompt: (input) => {
      const parsed = ReplyInputSchema.parse(input);
      return `Detect out-of-office status. Subject: ${parsed.subject}\nBody: ${parsed.bodyText}`;
    },
  },
  reply_draft: {
    name: "reply_draft",
    kind: "generation",
    promptVersion: "v1",
    inputSchema: DraftInputSchema,
    defaultPolicy: {
      qualityTier: "high",
      costTier: "premium",
      preferredProviders: ["anthropic", "openai", "gemini"],
      fallbackChain: ["openai", "gemini"],
      timeoutMs: 8000,
    },
    renderPrompt: (input) => {
      const parsed = DraftInputSchema.parse(input);
      return `Write a concise outreach reply to ${parsed.leadName} at ${parsed.company}. Goal: ${parsed.goal}. Prior thread: ${parsed.priorThread.join("\n")}`;
    },
  },
  personalization_snippet: {
    name: "personalization_snippet",
    kind: "generation",
    promptVersion: "v1",
    inputSchema: PersonalizationInputSchema,
    defaultPolicy: {
      qualityTier: "medium",
      costTier: "low",
      preferredProviders: ["deepseek", "openai", "anthropic"],
      fallbackChain: ["openai", "anthropic"],
      timeoutMs: 5000,
    },
    renderPrompt: (input) => {
      const parsed = PersonalizationInputSchema.parse(input);
      return `Write a short personalization snippet for ${parsed.company}. Lead: ${parsed.leadName ?? "unknown"}. Angle: ${parsed.angle}. Website summary: ${parsed.websiteSummary ?? "n/a"}`;
    },
  },
};
