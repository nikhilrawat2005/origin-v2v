// Gemini API key rotator and request service.
// Supported environment setup:
// GEMINI_API_KEYS="key1,key2,key3"

export class GeminiRotatorService {
  private static getKeys(): string[] {
    const keysStr = process.env.GEMINI_API_KEYS || process.env.NEXT_PUBLIC_GEMINI_API_KEYS || "";
    return keysStr
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);
  }

  private static currentKeyIndex = 0;

  /** Mask key for security logs (e.g. AQ.Ab8R...VTgSQ) */
  private static maskKey(key: string): string {
    if (key.length <= 12) return "******";
    return `${key.slice(0, 8)}...${key.slice(-6)}`;
  }

  // Make request with rotation and fallbacks
  public static async requestGemini(prompt: string, jsonMode: boolean = false): Promise<any> {
    const keys = this.getKeys();
    if (keys.length === 0) {
      throw new Error("No Gemini API keys found. Please set GEMINI_API_KEYS in your environment.");
    }

    let attempts = 0;
    const maxAttempts = keys.length;

    while (attempts < maxAttempts) {
      const activeKey = keys[this.currentKeyIndex];
      const maskedKey = this.maskKey(activeKey);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${activeKey}`;

      console.log(`[GeminiRotator] Trying request with key index ${this.currentKeyIndex} (${maskedKey}). Attempt ${attempts + 1}/${maxAttempts}`);

      try {
        const body: any = {
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        };

        if (jsonMode) {
          body.generationConfig = {
            responseMimeType: "application/json",
          };
        }

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        // 1. Check for rate limit or quota exceeded
        if (response.status === 429) {
          console.warn(`[GeminiRotator] Key ${this.currentKeyIndex} (${maskedKey}) rate limited (429). Rotating key.`);
          this.rotateKey(keys.length);
          attempts++;
          continue;
        }

        // 2. Check for other non-OK status codes (including key validation 400/403)
        if (!response.ok) {
          const errText = await response.text();
          console.warn(`[GeminiRotator] Key ${this.currentKeyIndex} (${maskedKey}) failed with status ${response.status}: ${errText}. Rotating key.`);
          this.rotateKey(keys.length);
          attempts++;
          continue;
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        // 3. Check for empty or invalid response text
        if (!text || text.trim().length === 0) {
          console.warn(`[GeminiRotator] Key ${this.currentKeyIndex} (${maskedKey}) returned empty/invalid response. Rotating key.`);
          this.rotateKey(keys.length);
          attempts++;
          continue;
        }

        console.log(`[GeminiRotator] Key ${this.currentKeyIndex} (${maskedKey}) succeeded!`);
        
        if (jsonMode) {
          return JSON.parse(text.trim());
        }
        return text;

      } catch (err: any) {
        console.error(`[GeminiRotator] Connection/Parsing error with key index ${this.currentKeyIndex} (${maskedKey}):`, err.message);
        // Rotate and try next key
        this.rotateKey(keys.length);
        attempts++;
        if (attempts >= maxAttempts) {
          throw new Error(`All available Gemini API keys failed. Last error: ${err.message}`);
        }
      }
    }

    throw new Error("Gemini request failed due to unknown reasons after rotating through all keys.");
  }

  private static rotateKey(totalKeys: number) {
    const oldIndex = this.currentKeyIndex;
    this.currentKeyIndex = (this.currentKeyIndex + 1) % totalKeys;
    console.log(`[GeminiRotator] Rotating API key index: ${oldIndex} -> ${this.currentKeyIndex}`);
  }
}
