const Table = require("cli-table3");

function consoleTable(head, matrix) {
  // Not used console.table as it output '[Object]' on large nested objects
  const table = new Table({ head: head });

  table.push(...matrix);

  return table.toString();
}

module.exports = {
  consoleTable,
};
