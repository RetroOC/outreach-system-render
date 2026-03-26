import { ZodError } from "zod";
import type {
  AiRunOptions,
  AiStructuredResult,
  AiTaskName,
  AiTextResult,
  ProviderName,
} from "../types.js";
import type { AiProviderAdapter } from "./providers/base.js";
import { TASKS } from "./tasks.js";

export class AiRuntime {
  constructor(private readonly providers: Map<ProviderName, AiProviderAdapter>) {}

  async runStructuredTask<TInput, TOutput>(
    taskName: AiTaskName,
    input: TInput,
    options: AiRunOptions = {},
  ): Promise<AiStructuredResult<TOutput>> {
    const task = TASKS[taskName];
    if (!task || task.kind !== "structured" || !task.outputSchema) {
      return this.failStructured(taskName, "TASK_NOT_FOUND", "Structured task not found");
    }

    try {
      task.inputSchema.parse(input);
    } catch (error) {
      return this.failStructured(taskName, "INVALID_INPUT", error instanceof ZodError ? error.message : "Invalid input");
    }

    const route = this.resolveProviders(task.defaultPolicy.preferredProviders, task.defaultPolicy.fallbackChain, options.preferredProviders);

    let fallbackUsed = false;
    for (let index = 0; index < route.length; index += 1) {
      const providerName = route[index];
      const provider = this.providers.get(providerName);
      if (!provider) continue;
      const model = provider.models[0]?.model;
      if (!model) continue;
      try {
        const response = await provider.structured<TOutput>({
          model,
          prompt: task.renderPrompt(input),
          schemaName: task.name,
        });
        const data = task.outputSchema.parse(response.output) as TOutput;
        const confidence = (response.confidence ?? 0.8);
        const minConfidence = options.minConfidence ?? task.defaultPolicy.minConfidence ?? 0;
        if (confidence < minConfidence) {
          fallbackUsed = true;
          continue;
        }
        return {
          ok: true,
          data,
          confidence,
          provider: response.provider,
          model: response.model,
          latencyMs: response.latencyMs,
          estimatedCostUsd: response.estimatedCostUsd,
          promptVersion: task.promptVersion,
          schemaVersion: task.schemaVersion,
          fallbackUsed: fallbackUsed || index > 0,
        };
      } catch {
        fallbackUsed = true;
      }
    }

    return this.failStructured(taskName, "NO_ROUTE_AVAILABLE", "No provider could satisfy the request", fallbackUsed);
  }

  async runGenerationTask<TInput>(
    taskName: AiTaskName,
    input: TInput,
    options: AiRunOptions = {},
  ): Promise<AiTextResult> {
    const task = TASKS[taskName];
    if (!task || task.kind !== "generation") {
      return this.failText(taskName, "TASK_NOT_FOUND", "Generation task not found");
    }

    try {
      task.inputSchema.parse(input);
    } catch (error) {
      return this.failText(taskName, "INVALID_INPUT", error instanceof ZodError ? error.message : "Invalid input");
    }

    const route = this.resolveProviders(task.defaultPolicy.preferredProviders, task.defaultPolicy.fallbackChain, options.preferredProviders);

    let fallbackUsed = false;
    for (let index = 0; index < route.length; index += 1) {
      const providerName = route[index];
      const provider = this.providers.get(providerName);
      if (!provider) continue;
      const model = provider.models[0]?.model;
      if (!model) continue;
      try {
        const response = await provider.generate({
          model,
          prompt: task.renderPrompt(input),
        });
        return {
          ok: true,
          text: response.text,
          provider: response.provider,
          model: response.model,
          latencyMs: response.latencyMs,
          estimatedCostUsd: response.estimatedCostUsd,
          promptVersion: task.promptVersion,
          fallbackUsed: fallbackUsed || index > 0,
        };
      } catch {
        fallbackUsed = true;
      }
    }

    return this.failText(taskName, "NO_ROUTE_AVAILABLE", "No provider could satisfy the request", fallbackUsed);
  }

  private resolveProviders(defaults: ProviderName[], fallbacks: ProviderName[], preferred?: ProviderName[]) {
    return [...new Set([...(preferred ?? defaults), ...defaults, ...fallbacks])];
  }

  private failStructured(taskName: string, code: "TASK_NOT_FOUND" | "INVALID_INPUT" | "NO_ROUTE_AVAILABLE", message: string, fallbackUsed = false): AiStructuredResult<never> {
    return {
      ok: false,
      provider: "openai",
      model: "n/a",
      latencyMs: 0,
      promptVersion: TASKS[taskName as AiTaskName]?.promptVersion ?? "n/a",
      fallbackUsed,
      error: { code, message },
    };
  }

  private failText(taskName: string, code: "TASK_NOT_FOUND" | "INVALID_INPUT" | "NO_ROUTE_AVAILABLE", message: string, fallbackUsed = false): AiTextResult {
    return {
      ok: false,
      provider: "openai",
      model: "n/a",
      latencyMs: 0,
      promptVersion: TASKS[taskName as AiTaskName]?.promptVersion ?? "n/a",
      fallbackUsed,
      error: { code, message },
    };
  }
}
