import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Botのコマンド一覧を表示します"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("NetAI Bot コマンド一覧")
      .addFields(
        {
          name: "AI部門",
          value: "`/ask question:` Geminiへ質問します。",
        },
        {
          name: "ネットワーク部門",
          value:
            "`/subnet cidr:` CIDRを計算します。\n" +
            "`/subnet-hosts hosts:` 必要ホスト数からCIDRを逆算します。",
        },
        {
          name: "共通・管理部門",
          value:
            "`/help` この一覧を表示します。\n" +
            "休止中は https://discord-ai-bot-c5en.onrender.com/ を開いてください。",
        },
      )
      .setFooter({ text: "NetAI Bot" });

    await interaction.reply({ embeds: [embed] });
  },
};
