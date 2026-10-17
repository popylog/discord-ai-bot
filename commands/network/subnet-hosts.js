import { SlashCommandBuilder } from "discord.js";
import { calculateSubnetForHosts } from "../../services/subnet.js";

export default {
  data: new SlashCommandBuilder()
    .setName("subnet-hosts")
    .setDescription("必要ホスト数から最小のIPv4サブネットを計算します")
    .addIntegerOption((option) =>
      option
        .setName("hosts")
        .setDescription("必要なホスト数（例: 50）")
        .setMinValue(1)
        .setMaxValue(4294967294)
        .setRequired(true),
    ),

  async execute(interaction) {
    const hosts = interaction.options.getInteger("hosts", true);
    await interaction.reply(
      ````text\n${calculateSubnetForHosts(hosts)}\n````,
    );
  },
};
