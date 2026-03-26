export type ProviderName = "openai" | "anthropic" | "deepseek" | "gemini" | "local";

export type AiTaskName =
  | "reply_classification"
  | "unsubscribe_detection"
  | "out_of_office_detection"
  | "reply_draft"
  | "personalization_snippet";

export type QualityTier = "low" | "medium" | "high";
export type CostTier = "low" | "balanced" | "premium";

export type AiRunOptions = {
  accountId?: string;
  preferredProviders?: ProviderName[];
  preferredModels?: string[];
  qualityTier?: QualityTier;
  costTier?: CostTier;
  maxLatencyMs?: number;
  maxCostUsd?: number;
  fallbackEnabled?: boolean;
  minConfidence?: number;
  temperature?: number;
  timeoutMs?: number;
  metadata?: Record<string, string>;
};

export type AiRuntimeErrorCode =
  | "TASK_NOT_FOUND"
  | "INVALID_INPUT"
  | "PROVIDER_UNAVAILABLE"
  | "PROVIDER_TIMEOUT"
  | "PROVIDER_RATE_LIMITED"
  | "UNSUPPORTED_CAPABILITY"
  | "INVALID_OUTPUT"
  | "LOW_CONFIDENCE"
  | "NO_ROUTE_AVAILABLE"
  | "POLICY_BLOCKED"
  | "UNKNOWN";

export type AiRuntimeError = {
  code: AiRuntimeErrorCode;
  message: string;
  details?: Record<string, unknown>;
};

export type AiStructuredResult<T> = {
  ok: boolean;
  data?: T;
  confidence?: number;
  provider: ProviderName;
  model: string;
  latencyMs: number;
  estimatedCostUsd?: number;
  promptVersion: string;
  schemaVersion?: string;
  fallbackUsed: boolean;
  warnings?: string[];
  error?: AiRuntimeError;
};

export type AiTextResult = {
  ok: boolean;
  text?: string;
  provider: ProviderName;
  model: string;
  latencyMs: number;
  estimatedCostUsd?: number;
  promptVersion: string;
  fallbackUsed: boolean;
  warnings?: string[];
  error?: AiRuntimeError;
};

export type ProviderStructuredResponse<T> = {
  provider: ProviderName;
  model: string;
  output: T;
  confidence?: number;
  latencyMs: number;
  estimatedCostUsd?: number;
};

export type ProviderTextResponse = {
  provider: ProviderName;
  model: string;
  text: string;
  latencyMs: number;
  estimatedCostUsd?: number;
};

export type ProviderModelMetadata = {
  provider: ProviderName;
  model: string;
  qualityTier: QualityTier;
  costTier: CostTier;
  maxLatencyMs: number;
  enabled: boolean;
};
