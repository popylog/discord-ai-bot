import test from "node:test";
import assert from "node:assert/strict";
import { commandData, commands } from "../commands/index.js";

test("全コマンドの名前が重複していない", () => {
  const names = commandData.map((command) => command.name);
  assert.equal(new Set(names).size, names.length);
});

test("全コマンドに実行処理がある", () => {
  for (const command of commands) {
    assert.equal(typeof command.execute, "function");
  }
});
