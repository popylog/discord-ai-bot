import "dotenv/config";

import { GoogleGenAI } from "@google/genai";
import { Client, Events, GatewayIntentBits, MessageFlags } from "discord.js";

const { DISCORD_TOKEN, GEMINI_API_KEY } = process.env;

if (!DISCORD_TOKEN || !GEMINI_API_KEY) {
  console.error("DISCORD_TOKEN と GEMINI_API_KEY を環境変数に設定してください。");
  process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

client.once(Events.ClientReady, (readyClient) => {
  console.log(`${readyClient.user.tag} としてログインしました。`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand() || interaction.commandName !== "ask") {
    return;
  }

  await interaction.deferReply();

  try {
    const question = interaction.options.getString("question", true);
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: question,
    });
    const answer = response.text?.trim() || "回答を生成できませんでした。";

    // Discord の1メッセージ上限に合わせて、長い回答は複数回に分けます。
    const chunks = answer.match(/[\s\S]{1,2000}/g) ?? [answer];
    await interaction.editReply(chunks.shift());

    for (const chunk of chunks) {
      await interaction.followUp(chunk);
    }
  } catch (error) {
    console.error("Gemini API の呼び出しに失敗しました:", error);
    await interaction.editReply(
      "エラーが発生しました。しばらく待ってから、もう一度お試しください。",
    );
  }
});

client.on(Events.Error, (error) => {
  console.error("Discord クライアントでエラーが発生しました:", error);
});

client.login(DISCORD_TOKEN).catch((error) => {
  console.error("Discord へのログインに失敗しました:", error);
  process.exit(1);
});
