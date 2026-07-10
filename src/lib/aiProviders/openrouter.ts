// OpenRouter API key rotator and request service (backup AI provider).
// Supported environment setup:
// OPENROUTER_API_KEYS="key1,key2"
// OPENROUTER_MODEL="openrouter/free" (optional override)

export class OpenRouterService {
  private static getKeys(): string[] {
    const keysStr = process.env.OPENROUTER_API_KEYS || "";
    return keysStr
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);
  }

  private static currentKeyIndex = 0;

  private static getModel(): string {
    return process.env.OPENROUTER_MODEL || "openrouter/free";
  }

  private static maskKey(key: string): string {
    if (key.length <= 12) return "******";
    return `${key.slice(0, 8)}...${key.slice(-6)}`;
  }

  public static async request(prompt: string, jsonMode: boolean = false): Promise<any> {
    const keys = this.getKeys();
    if (keys.length === 0) {
      throw new Error("No OpenRouter API keys found. Please set OPENROUTER_API_KEYS in your environment.");
    }

    const model = this.getModel();
    let attempts = 0;
    const maxAttempts = keys.length;

    while (attempts < maxAttempts) {
      const activeKey = keys[this.currentKeyIndex];
      const maskedKey = this.maskKey(activeKey);
      const url = "https://openrouter.ai/api/v1/chat/completions";

      console.log(`[OpenRouterService] Trying request with key index ${this.currentKeyIndex} (${maskedKey}). Attempt ${attempts + 1}/${maxAttempts}`);

      try {
        const body: any = {
          model,
          messages: [{ role: "user", content: prompt }],
        };

        if (jsonMode) {
          body.response_format = { type: "json_object" };
        }

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${activeKey}`,
        };

        // Optional OpenRouter attribution headers (safe to omit if not set)
        if (process.env.NEXT_PUBLIC_APP_URL) {
          headers["HTTP-Referer"] = process.env.NEXT_PUBLIC_APP_URL;
        }
        if (process.env.NEXT_PUBLIC_APP_NAME) {
          headers["X-Title"] = process.env.NEXT_PUBLIC_APP_NAME;
        }

        const response = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        });

        if (response.status === 429) {
          console.warn(`[OpenRouterService] Key ${this.currentKeyIndex} (${maskedKey}) rate limited (429). Rotating key.`);
          this.rotateKey(keys.length);
          attempts++;
          continue;
        }

        if (!response.ok) {
          const errText = await response.text();
          console.warn(`[OpenRouterService] Key ${this.currentKeyIndex} (${maskedKey}) failed with status ${response.status}: ${errText}. Rotating key.`);
          this.rotateKey(keys.length);
          attempts++;
          continue;
        }

        const data = await response.json();
        const text = data?.choices?.[0]?.message?.content;

        if (!text || text.trim().length === 0) {
          console.warn(`[OpenRouterService] Key ${this.currentKeyIndex} (${maskedKey}) returned empty/invalid response. Rotating key.`);
          this.rotateKey(keys.length);
          attempts++;
          continue;
        }

        if (jsonMode) {
          try {
            const parsed = JSON.parse(text.trim());
            console.log(`[OpenRouterService] Key ${this.currentKeyIndex} (${maskedKey}) succeeded!`);
            return parsed;
          } catch (parseErr: any) {
            console.warn(`[OpenRouterService] Key ${this.currentKeyIndex} (${maskedKey}) returned invalid JSON. Rotating key. Error: ${parseErr.message}`);
            this.rotateKey(keys.length);
            attempts++;
            continue;
          }
        }

        console.log(`[OpenRouterService] Key ${this.currentKeyIndex} (${maskedKey}) succeeded!`);
        return text;
      } catch (err: any) {
        console.error(`[OpenRouterService] Connection/parsing error with key index ${this.currentKeyIndex} (${maskedKey}):`, err.message);
        this.rotateKey(keys.length);
        attempts++;
        if (attempts >= maxAttempts) {
          throw new Error(`All available OpenRouter API keys failed. Last error: ${err.message}`);
        }
      }
    }

    throw new Error("OpenRouter request failed due to unknown reasons after rotating through all keys.");
  }

  private static rotateKey(totalKeys: number) {
    const oldIndex = this.currentKeyIndex;
    this.currentKeyIndex = (this.currentKeyIndex + 1) % totalKeys;
    console.log(`[OpenRouterService] Rotating API key index: ${oldIndex} -> ${this.currentKeyIndex}`);
  }
}
