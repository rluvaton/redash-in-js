import { consoleTable } from "./console.js";
import { markdownTable } from "./markdown.js";
import { convertArrayOfObjectsToStringMatrix } from './helpers.js';

/**
 *
 * @param {any[]} data
 * @param {'console' | 'markdown'} type
 */
export function logTable(data, type = "console") {
  const { head, matrix } = convertArrayOfObjectsToStringMatrix(data);

  if (!head.length) {
    return;
  }

  /**
   * @type {string}
   */
  let table;

  switch (type) {
    case "markdown":
      table = markdownTable(head, matrix);
      break;

    case "console":
    default:
      if (type && type !== 'console') {
        console.warn(`Unknown table type ${type}`);
      }

      table = consoleTable(head, matrix);
      break;
  }

  console.log(table);
}
