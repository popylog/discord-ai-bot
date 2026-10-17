import { createServer } from "node:http";

export function startHealthServer() {
  const port = Number(process.env.PORT) || 3000;
  const server = createServer((_request, response) => {
    response.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Discord Gemini Bot is running.\n");
  });

  server.listen(port, "0.0.0.0", () => {
    console.log(`稼働確認用サーバーをポート ${port} で起動しました。`);
  });

  return server;
}
