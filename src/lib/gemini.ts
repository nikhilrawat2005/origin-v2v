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
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${activeKey}`;

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

        if (response.status === 429) {
          console.warn(`Key index ${this.currentKeyIndex} rate limited (429). Rotating to next key.`);
          this.rotateKey(keys.length);
          attempts++;
          continue;
        }

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Gemini API error: ${response.status} ${errText}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
          throw new Error("Gemini response is empty or formatted incorrectly");
        }

        if (jsonMode) {
          return JSON.parse(text.trim());
        }
        return text;

      } catch (err: any) {
        console.error(`Attempt with key index ${this.currentKeyIndex} failed:`, err.message);
        // Rotate and try next key
        this.rotateKey(keys.length);
        attempts++;
        if (attempts >= maxAttempts) {
          throw new Error(`All available Gemini keys failed: ${err.message}`);
        }
      }
    }

    throw new Error("Gemini request failed due to unknown reasons.");
  }

  private static rotateKey(totalKeys: number) {
    this.currentKeyIndex = (this.currentKeyIndex + 1) % totalKeys;
  }
}
