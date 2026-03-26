import { MockProviderAdapter } from "./mockProvider.js";

export class AnthropicAdapter extends MockProviderAdapter {
  constructor() {
    super("anthropic");
  }
}
