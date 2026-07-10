// Groq API key rotator and request service (primary AI provider).
// Supported environment setup:
// GROQ_API_KEYS="key1,key2,key3"
// GROQ_MODEL="llama-3.1-8b-instant" (optional override)

export class GroqService {
  private static getKeys(): string[] {
    const keysStr = process.env.GROQ_API_KEYS || "";
    return keysStr
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);
  }

  private static currentKeyIndex = 0;

  private static getModel(): string {
    return process.env.GROQ_MODEL || "llama-3.1-8b-instant";
  }

  /** Mask key for security logs */
  private static maskKey(key: string): string {
    if (key.length <= 12) return "******";
    return `${key.slice(0, 8)}...${key.slice(-6)}`;
  }

  public static async request(prompt: string, jsonMode: boolean = false): Promise<any> {
    const keys = this.getKeys();
    if (keys.length === 0) {
      throw new Error("No Groq API keys found. Please set GROQ_API_KEYS in your environment.");
    }

    const model = this.getModel();
    let attempts = 0;
    const maxAttempts = keys.length;

    while (attempts < maxAttempts) {
      const activeKey = keys[this.currentKeyIndex];
      const maskedKey = this.maskKey(activeKey);
      const url = "https://api.groq.com/openai/v1/chat/completions";

      console.log(`[GroqService] Trying request with key index ${this.currentKeyIndex} (${maskedKey}). Attempt ${attempts + 1}/${maxAttempts}`);

      try {
        const body: any = {
          model,
          messages: [{ role: "user", content: prompt }],
        };

        if (jsonMode) {
          body.response_format = { type: "json_object" };
        }

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${activeKey}`,
          },
          body: JSON.stringify(body),
        });

        // 1. Rate limit or quota exceeded
        if (response.status === 429) {
          console.warn(`[GroqService] Key ${this.currentKeyIndex} (${maskedKey}) rate limited (429). Rotating key.`);
          this.rotateKey(keys.length);
          attempts++;
          continue;
        }

        // 2. Other non-OK status codes (auth failures, invalid model, etc.)
        if (!response.ok) {
          const errText = await response.text();
          console.warn(`[GroqService] Key ${this.currentKeyIndex} (${maskedKey}) failed with status ${response.status}: ${errText}. Rotating key.`);
          this.rotateKey(keys.length);
          attempts++;
          continue;
        }

        const data = await response.json();
        const text = data?.choices?.[0]?.message?.content;

        // 3. Empty or invalid response text
        if (!text || text.trim().length === 0) {
          console.warn(`[GroqService] Key ${this.currentKeyIndex} (${maskedKey}) returned empty/invalid response. Rotating key.`);
          this.rotateKey(keys.length);
          attempts++;
          continue;
        }

        if (jsonMode) {
          try {
            const parsed = JSON.parse(text.trim());
            console.log(`[GroqService] Key ${this.currentKeyIndex} (${maskedKey}) succeeded!`);
            return parsed;
          } catch (parseErr: any) {
            console.warn(`[GroqService] Key ${this.currentKeyIndex} (${maskedKey}) returned invalid JSON. Rotating key. Error: ${parseErr.message}`);
            this.rotateKey(keys.length);
            attempts++;
            continue;
          }
        }

        console.log(`[GroqService] Key ${this.currentKeyIndex} (${maskedKey}) succeeded!`);
        return text;
      } catch (err: any) {
        console.error(`[GroqService] Connection/parsing error with key index ${this.currentKeyIndex} (${maskedKey}):`, err.message);
        this.rotateKey(keys.length);
        attempts++;
        if (attempts >= maxAttempts) {
          throw new Error(`All available Groq API keys failed. Last error: ${err.message}`);
        }
      }
    }

    throw new Error("Groq request failed due to unknown reasons after rotating through all keys.");
  }

  private static rotateKey(totalKeys: number) {
    const oldIndex = this.currentKeyIndex;
    this.currentKeyIndex = (this.currentKeyIndex + 1) % totalKeys;
    console.log(`[GroqService] Rotating API key index: ${oldIndex} -> ${this.currentKeyIndex}`);
  }
}
