import "dotenv/config";

import { Client, Events, GatewayIntentBits, MessageFlags } from "discord.js";
import { commands, commandMap } from "./commands/index.js";
import { startHealthServer } from "./services/health-server.js";

const { DISCORD_TOKEN, GEMINI_API_KEY } = process.env;

if (!DISCORD_TOKEN || !GEMINI_API_KEY) {
  console.error("DISCORD_TOKEN と GEMINI_API_KEY を環境変数に設定してください。");
  process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

startHealthServer();

client.once(Events.ClientReady, (readyClient) => {
  console.log(`${readyClient.user.tag} としてログインしました。`);
  console.log(`${commands.length}個のコマンドを読み込みました。`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  const command = commandMap.get(interaction.commandName);
  if (!command) {
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`/${interaction.commandName} の実行に失敗しました:`, error);
    const message = "エラーが発生しました。しばらく待ってから、もう一度お試しください。";

    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(message).catch(() => {});
    } else {
      await interaction
        .reply({ content: message, flags: MessageFlags.Ephemeral })
        .catch(() => {});
    }
  }
});

client.on(Events.Error, (error) => {
  console.error("Discord クライアントでエラーが発生しました:", error);
});

client.login(DISCORD_TOKEN).catch((error) => {
  console.error("Discord へのログインに失敗しました:", error);
  process.exit(1);
});
