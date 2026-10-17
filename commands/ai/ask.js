import { SlashCommandBuilder } from "discord.js";
import { askGeminiWithRetry } from "../../services/gemini.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ask")
    .setDescription("Gemini に質問します")
    .addStringOption((option) =>
      option
        .setName("question")
        .setDescription("Gemini に聞きたいこと")
        .setRequired(true),
    ),

  async execute(interaction) {
    await interaction.deferReply();
    const question = interaction.options.getString("question", true);
    const response = await askGeminiWithRetry(question);
    const answer = response.text?.trim() || "回答を生成できませんでした。";
    const chunks = answer.match(/[\s\S]{1,2000}/g) ?? [answer];

    await interaction.editReply(chunks.shift());
    for (const chunk of chunks) {
      await interaction.followUp(chunk);
    }
  },
};
