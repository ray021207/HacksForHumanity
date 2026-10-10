import Anthropic from "@anthropic-ai/sdk";
import { CLASSIFIER_SYSTEM_PROMPT, type ClassifierInput, type ModelInvoker } from "./safety";
import { GENERATION_SYSTEM_PROMPT, type ModelInvoker as GenerationModelInvoker } from "./generation";

export const DEFAULT_MODEL_NAME = "claude-sonnet-5-5";

export function getModelName(): string {
  return process.env.MODEL_NAME || DEFAULT_MODEL_NAME;
}

let cachedClient: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!cachedClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not set. Add it to .env.local.");
    }
    cachedClient = new Anthropic({ apiKey });
  }
  return cachedClient;
}

function extractText(message: Anthropic.Message): string {
  return message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("");
}

/** Builds a ModelInvoker that calls the real Anthropic API for the safety classifier. */
export function createClassifierInvoker(
  client: Anthropic = getAnthropicClient(),
  modelName: string = getModelName()
): ModelInvoker {
  return async (input: ClassifierInput): Promise<string> => {
    const message = await client.messages.create({
      model: modelName,
      max_tokens: 300,
      system: CLASSIFIER_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: JSON.stringify(input),
        },
      ],
    });
    return extractText(message);
  };
}

/** Builds a ModelInvoker that calls the real Anthropic API for card generation. */
export function createGenerationInvoker(
  client: Anthropic = getAnthropicClient(),
  modelName: string = getModelName()
): GenerationModelInvoker {
  return async (prompt: string): Promise<string> => {
    const message = await client.messages.create({
      model: modelName,
      // 5 starters with text/why/avoid fields can run long; 1200 truncated
      // valid JSON mid-string often enough to matter (~18% of a 50-scenario
      // sample). 2048 comfortably covers the observed max.
      max_tokens: 2048,
      system: GENERATION_SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    });
    return extractText(message);
  };
}
