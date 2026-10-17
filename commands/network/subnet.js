import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { calculateSubnet } from "../../services/subnet.js";

export default {
  data: new SlashCommandBuilder()
    .setName("subnet")
    .setDescription("IPv4サブネットを計算します")
    .addStringOption((option) =>
      option
        .setName("cidr")
        .setDescription("例: 192.168.1.10/24")
        .setRequired(true),
    ),

  async execute(interaction) {
    try {
      const cidr = interaction.options.getString("cidr", true);
      await interaction.reply(`\`\`\`text\n${calculateSubnet(cidr)}\n\`\`\``);
    } catch (error) {
      await interaction.reply({
        content: error.message,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
