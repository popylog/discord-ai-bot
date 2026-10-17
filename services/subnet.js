function integerToIp(value) {
  return [24, 16, 8, 0].map((shift) => (value >>> shift) & 255).join(".");
}

export function calculateSubnet(cidr) {
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

export function calculateSubnetForHosts(requiredHosts) {
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
