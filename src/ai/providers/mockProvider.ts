import type { AiProviderAdapter } from "./base.js";
import type {
  ProviderModelMetadata,
  ProviderName,
  ProviderStructuredResponse,
  ProviderTextResponse,
} from "../../types.js";

const MODELS: Record<ProviderName, ProviderModelMetadata[]> = {
  openai: [{ provider: "openai", model: "gpt-4.1-mini", qualityTier: "medium", costTier: "balanced", maxLatencyMs: 5000, enabled: true }],
  anthropic: [{ provider: "anthropic", model: "claude-3-5-sonnet", qualityTier: "high", costTier: "premium", maxLatencyMs: 7000, enabled: true }],
  deepseek: [{ provider: "deepseek", model: "deepseek-chat", qualityTier: "medium", costTier: "low", maxLatencyMs: 4500, enabled: true }],
  gemini: [{ provider: "gemini", model: "gemini-2.0-flash", qualityTier: "medium", costTier: "balanced", maxLatencyMs: 5000, enabled: true }],
  local: [{ provider: "local", model: "llama-3.1-70b", qualityTier: "medium", costTier: "low", maxLatencyMs: 9000, enabled: true }],
};

export class MockProviderAdapter implements AiProviderAdapter {
  readonly name: ProviderName;
  readonly models: ProviderModelMetadata[];

  constructor(name: ProviderName) {
    this.name = name;
    this.models = MODELS[name];
  }

  async structured<TOutput>(input: {
    model: string;
    prompt: string;
    schemaName: string;
  }): Promise<ProviderStructuredResponse<TOutput>> {
    const started = Date.now();
    const output = this.mockStructured<TOutput>(input.schemaName, input.prompt);
    return {
      provider: this.name,
      model: input.model,
      output,
      confidence: 0.9,
      latencyMs: Date.now() - started,
      estimatedCostUsd: 0.0005,
    };
  }

  async generate(input: { model: string; prompt: string }): Promise<ProviderTextResponse> {
    const started = Date.now();
    return {
      provider: this.name,
      model: input.model,
      text: `Mock response from ${this.name} for prompt: ${input.prompt.slice(0, 120)}`,
      latencyMs: Date.now() - started,
      estimatedCostUsd: 0.001,
    };
  }

  private mockStructured<TOutput>(schemaName: string, prompt: string): TOutput {
    if (schemaName === "reply_classification") {
      return {
        label: prompt.toLowerCase().includes("unsubscribe") ? "unsubscribe" : "positive",
        confidence: 0.91,
        signals: ["mock-signal"],
        suggestedAction: prompt.toLowerCase().includes("unsubscribe") ? "stop" : "manual_review",
      } as TOutput;
    }

    if (schemaName === "unsubscribe_detection") {
      return {
        isUnsubscribe: prompt.toLowerCase().includes("unsubscribe"),
        confidence: 0.93,
        reason: "mock-reason",
      } as TOutput;
    }

    if (schemaName === "out_of_office_detection") {
      return {
        isOutOfOffice: prompt.toLowerCase().includes("out of office"),
        confidence: 0.88,
        returnDate: null,
      } as TOutput;
    }

    return {} as TOutput;
  }
}
