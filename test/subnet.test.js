import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateSubnet,
  calculateSubnetForHosts,
} from "../services/subnet.js";

test("CIDRからネットワーク情報を計算する", () => {
  const result = calculateSubnet("192.168.1.10/24");
  assert.match(result, /ネットワーク: 192\.168\.1\.0\/24/);
  assert.match(result, /ブロードキャスト: 192\.168\.1\.255/);
  assert.match(result, /利用可能ホスト数: 254/);
});

test("必要ホスト数から最小CIDRを計算する", () => {
  const result = calculateSubnetForHosts(50);
  assert.match(result, /推奨CIDR: \/26/);
  assert.match(result, /利用可能ホスト数: 62/);
});

test("不正なCIDRを拒否する", () => {
  assert.throws(() => calculateSubnet("999.1.1.1/24"), /0〜255/);
});
