import ask from "./ai/ask.js";
import subnet from "./network/subnet.js";
import subnetHosts from "./network/subnet-hosts.js";
import help from "./utility/help.js";

export const commands = [ask, subnet, subnetHosts, help];
export const commandData = commands.map((command) => command.data.toJSON());
export const commandMap = new Map(
  commands.map((command) => [command.data.name, command]),
);
