// AI Router: tries Groq (primary) first, falls back to OpenRouter (backup)
// if all Groq keys are exhausted/failing.

import { GroqService } from "./groq";
import { OpenRouterService } from "./openrouter";

export class AIRouterService {
  public static async requestAI(prompt: string, jsonMode: boolean = false): Promise<any> {
    try {
      return await GroqService.request(prompt, jsonMode);
    } catch (groqErr: any) {
      console.warn(`[AIRouter] Groq failed, falling back to OpenRouter. Reason: ${groqErr.message}`);

      try {
        return await OpenRouterService.request(prompt, jsonMode);
      } catch (openRouterErr: any) {
        throw new Error(
          `All AI providers (Groq, OpenRouter) failed. Last error: ${openRouterErr.message}`
        );
      }
    }
  }
}

export { GroqService } from "./groq";
export { OpenRouterService } from "./openrouter";
