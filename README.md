# Discord Gemini Bot

Discord の `/ask` コマンドで質問し、Gemini API の回答を受け取る最小構成の Node.js Bot です。

Gemini APIが混雑などで一時エラーを返した場合は、自動的に最大3回まで再試行します。

`/subnet` コマンドでは、IPv4のCIDRからネットワーク情報を自動計算できます。

`/subnet-hosts` コマンドでは、必要ホスト数から最小のIPv4サブネットを逆算できます。

## 事前に用意するもの

- Node.js 20 以上
- Discord Bot のトークン
- Gemini API キー
- Bot を追加済みの Discord サーバー

トークンとAPIキーは秘密情報です。GitHubやチャットには貼らないでください。

## 1. ファイルをダウンロードする

ターミナルで次を順番に実行します。

```bash
git clone https://github.com/popylog/discord-ai-bot.git
cd discord-ai-bot
npm install
```

## 2. 秘密情報を設定する

プロジェクト直下に `.env` という名前のファイルを作り、次の2行を書きます。`ここに〜` の部分だけ自分の値に置き換えてください。

```env
DISCORD_TOKEN=ここにDiscordのBotトークン
GEMINI_API_KEY=ここにGeminiのAPIキー
```

`.env` は `.gitignore` に含まれているため、GitHubにはアップロードされません。

## 3. `/ask` コマンドを登録する

最初の1回だけ、次を実行します。

```bash
npm run deploy-commands
```

`/ask コマンドを登録しました。` と表示されれば成功です。これは全サーバー共通のグローバルコマンドなので、Discordに表示されるまで少し時間がかかる場合があります。

## 4. Botを起動する

```bash
npm start
```

`○○ としてログインしました。` と表示されたら、Discordで次のように使えます。

```text
/ask question: 日本の首都は？
```

サブネット計算は次のように使います。

```text
/subnet cidr: 192.168.1.10/24
```

必要ホスト数から逆算する場合は次のように使います。

```text
/subnet-hosts hosts: 50
```

Botを止めるときは、ターミナルで `Ctrl + C` を押します。

## Renderへ無料で公開する

Renderでは「Background Worker」ではなく「Web Service」を選び、無料プランを使用します。

- Build Command: `npm install`
- Start Command: `npm start`
- Instance Type: `Free`

Environment Variablesには `DISCORD_TOKEN` と `GEMINI_API_KEY` を登録してください。値をGitHubへ保存してはいけません。

## うまく動かないとき

- `/ask` が表示されない: コマンド登録を実行し、数分待ってDiscordを開き直してください。
- Botがオフライン: `npm start` を実行しているターミナルを閉じていないか確認してください。
- ログインに失敗する: `DISCORD_TOKEN` に余分な空白や引用符が入っていないか確認してください。
- Geminiの呼び出しに失敗する: `GEMINI_API_KEY` が正しいか、APIの利用上限に達していないか確認してください。

## ファイル構成

```text
discord-ai-bot/
├── index.js             # Bot本体
├── deploy-commands.js   # /ask コマンドの登録
├── package.json         # 必要なライブラリと起動コマンド
├── .gitignore           # 秘密情報などをGit管理から除外
└── README.md            # この説明書
```
