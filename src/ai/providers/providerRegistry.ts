import type { ProviderName } from "../../types.js";
import { AnthropicAdapter } from "./anthropicAdapter.js";
import { DeepseekAdapter } from "./deepseekAdapter.js";
import { MockProviderAdapter } from "./mockProvider.js";
import { OpenAiAdapter } from "./openaiAdapter.js";

export function buildAiProviderRegistry() {
  return new Map<ProviderName, MockProviderAdapter>([
    ["openai", new OpenAiAdapter()],
    ["anthropic", new AnthropicAdapter()],
    ["deepseek", new DeepseekAdapter()],
    ["gemini", new MockProviderAdapter("gemini")],
    ["local", new MockProviderAdapter("local")],
  ]);
}
