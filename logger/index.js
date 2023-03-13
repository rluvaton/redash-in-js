import debug from "debug";
import chalk from "chalk";
export { logTable } from "./table/index.js";

export function logError(message, ...rest) {
  console.log(chalk.red(message), ...rest);
}

export function logWarning(message, ...rest) {
  console.log(chalk.yellow(message), ...rest);
}


export const logger = debug("app");
