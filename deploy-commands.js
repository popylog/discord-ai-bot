import "dotenv/config";

import {
  Client,
  Events,
  GatewayIntentBits,
  SlashCommandBuilder,
} from "discord.js";

const { DISCORD_TOKEN } = process.env;

if (!DISCORD_TOKEN) {
  console.error("DISCORD_TOKEN を環境変数に設定してください。");
  process.exit(1);
}

const commands = [
  new SlashCommandBuilder()
    .setName("ask")
    .setDescription("Gemini に質問します")
    .addStringOption((option) =>
      option
        .setName("question")
        .setDescription("Gemini に聞きたいこと")
        .setRequired(true),
    ),
  new SlashCommandBuilder()
    .setName("subnet")
    .setDescription("IPv4サブネットを計算します")
    .addStringOption((option) =>
      option
        .setName("cidr")
        .setDescription("例: 192.168.1.10/24")
        .setRequired(true),
    ),
  new SlashCommandBuilder()
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
].map((command) => command.toJSON());

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

try {
  const ready = new Promise((resolve) => client.once(Events.ClientReady, resolve));
  await client.login(DISCORD_TOKEN);
  await ready;
  await client.application.commands.set(commands);
  console.log("/ask、/subnet、/subnet-hosts コマンドを登録しました。");
} catch (error) {
  console.error("コマンドの登録に失敗しました:", error);
  process.exitCode = 1;
} finally {
  client.destroy();
}
