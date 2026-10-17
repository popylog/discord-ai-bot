import { GoogleGenAI } from "@google/genai";

const retryableStatuses = new Set([429, 500, 502, 503, 504]);
let ai;

function getClient() {
  ai ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return ai;
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function askGeminiWithRetry(question, maxAttempts = 3) {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await getClient().models.generateContent({
        model: "gemini-3.8-flash",
        contents: question,
      });
    } catch (error) {
      const shouldRetry =
        retryableStatuses.has(error.status) && attempt < maxAttempts;

      if (!shouldRetry) {
        throw error;
      }

      const delay = 1000 * 2 ** (attempt - 1);
      console.warn(
        `Gemini APIが一時エラーを返しました。${delay}ms後に再試行します ` +
          `(${attempt}/${maxAttempts})。`,
      );
      await wait(delay);
    }
  }

  throw new Error("Gemini APIの再試行回数を超えました。");
}
