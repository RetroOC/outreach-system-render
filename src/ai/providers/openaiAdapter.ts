import { MockProviderAdapter } from "./mockProvider.js";

export class OpenAiAdapter extends MockProviderAdapter {
  constructor() {
    super("openai");
  }
}
