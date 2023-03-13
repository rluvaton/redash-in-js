import Table from "cli-table3";

export function consoleTable(head, matrix) {
  // Not used console.table as it output '[Object]' on large nested objects
  const table = new Table({ head: head });

  table.push(...matrix);

  return table.toString();
}

