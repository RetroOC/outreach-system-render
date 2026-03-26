import type {
  ProviderModelMetadata,
  ProviderStructuredResponse,
  ProviderTextResponse,
  ProviderName,
} from "../../types.js";

export interface AiProviderAdapter {
  readonly name: ProviderName;
  readonly models: ProviderModelMetadata[];

  structured<TOutput>(input: {
    model: string;
    prompt: string;
    schemaName: string;
  }): Promise<ProviderStructuredResponse<TOutput>>;

  generate(input: {
    model: string;
    prompt: string;
  }): Promise<ProviderTextResponse>;
}
