import "dotenv/config";

import { GoogleGenAI } from "@google/genai";
import { Client, Events, GatewayIntentBits } from "discord.js";
import { createServer } from "node:http";

const { DISCORD_TOKEN, GEMINI_API_KEY } = process.env;

if (!DISCORD_TOKEN || !GEMINI_API_KEY) {
  console.error("DISCORD_TOKEN と GEMINI_API_KEY を環境変数に設定してください。");
  process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
const port = Number(process.env.PORT) || 3000;

// Render の無料 Web Service が稼働確認できるようにHTTPで応答します。
const server = createServer((_request, response) => {
  response.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
  response.end("Discord Gemini Bot is running.\n");
});

server.listen(port, "0.0.0.0", () => {
  console.log(`稼働確認用サーバーをポート ${port} で起動しました。`);
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`${readyClient.user.tag} としてログインしました。`);
});

function integerToIp(value) {
  return [24, 16, 8, 0].map((shift) => (value >>> shift) & 255).join(".");
}

function calculateSubnet(cidr) {
  const match = cidr.trim().match(/^(\d{1,3}(?:\.\d{1,3}){3})\/(\d|[12]\d|3[0-2])$/);

  if (!match) {
    throw new Error("CIDRは 192.168.1.10/24 の形式で入力してください。");
  }

  const octets = match[1].split(".").map(Number);
  if (octets.some((octet) => octet > 255)) {
    throw new Error("IPアドレスの各数値は0〜255で入力してください。");
  }

  const prefix = Number(match[2]);
  const ip = octets.reduce((value, octet) => ((value << 8) | octet) >>> 0, 0);
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const network = (ip & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;
  const totalAddresses = 2 ** (32 - prefix);
  const usableHosts = prefix === 32 ? 1 : prefix === 31 ? 2 : totalAddresses - 2;
  const firstHost = prefix >= 31 ? network : network + 1;
  const lastHost = prefix >= 31 ? broadcast : broadcast - 1;

  return [
    `入力IP: ${integerToIp(ip)}/${prefix}`,
    `ネットワーク: ${integerToIp(network)}/${prefix}`,
    `サブネットマスク: ${integerToIp(mask)}`,
    `ブロードキャスト: ${integerToIp(broadcast)}`,
    `利用可能範囲: ${integerToIp(firstHost)} - ${integerToIp(lastHost)}`,
    `利用可能ホスト数: ${usableHosts.toLocaleString("ja-JP")}`,
  ].join("\n");
}

function calculateSubnetForHosts(requiredHosts) {
  for (let prefix = 32; prefix >= 0; prefix -= 1) {
    const totalAddresses = 2 ** (32 - prefix);
    const usableHosts = prefix === 32 ? 1 : prefix === 31 ? 2 : totalAddresses - 2;

    if (usableHosts >= requiredHosts) {
      const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;

      return [
        `必要ホスト数: ${requiredHosts.toLocaleString("ja-JP")}`,
        `推奨CIDR: /${prefix}`,
        `サブネットマスク: ${integerToIp(mask)}`,
        `総アドレス数: ${totalAddresses.toLocaleString("ja-JP")}`,
        `利用可能ホスト数: ${usableHosts.toLocaleString("ja-JP")}`,
        `余裕: ${(usableHosts - requiredHosts).toLocaleString("ja-JP")}`,
      ].join("\n");
    }
  }

  throw new Error("指定されたホスト数をIPv4サブネットに収容できません。");
}

const retryableStatuses = new Set([429, 500, 502, 503, 504]);

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function askGeminiWithRetry(question, maxAttempts = 3) {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await ai.models.generateContent({
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

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  if (interaction.commandName === "subnet") {
    try {
      const cidr = interaction.options.getString("cidr", true);
      await interaction.reply(`\`\`\`text\n${calculateSubnet(cidr)}\n\`\`\``);
    } catch (error) {
      await interaction.reply({ content: error.message, ephemeral: true });
    }
    return;
  }

  if (interaction.commandName === "subnet-hosts") {
    const hosts = interaction.options.getInteger("hosts", true);
    await interaction.reply(
      `\`\`\`text\n${calculateSubnetForHosts(hosts)}\n\`\`\``,
    );
    return;
  }

  if (interaction.commandName !== "ask") {
    return;
  }

  await interaction.deferReply();

  try {
    const question = interaction.options.getString("question", true);
    const response = await askGeminiWithRetry(question);
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
