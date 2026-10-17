import "dotenv/config";

import { Client, Events, GatewayIntentBits } from "discord.js";
import { commandData } from "./commands/index.js";

const { DISCORD_TOKEN } = process.env;

if (!DISCORD_TOKEN) {
  console.error("DISCORD_TOKEN を環境変数に設定してください。");
  process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

try {
  const ready = new Promise((resolve) => client.once(Events.ClientReady, resolve));
  await client.login(DISCORD_TOKEN);
  await ready;
  await client.application.commands.set(commandData);
  console.log(`${commandData.length}個のコマンドを登録しました。`);
} catch (error) {
  console.error("コマンドの登録に失敗しました:", error);
  process.exitCode = 1;
} finally {
  client.destroy();
}
