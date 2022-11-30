const debug = require("debug");
const Table = require("cli-table3");
const util = require("util");

const colorEnabled = process.env.COLORS_DISABLED == null;

// removes all the color characters from a string
function stripColors(str) {
  return str.split(/\u001b\[(?:\d*;){0,5}\d*m/g).join('');
}

function convertArrayOfObjectsToStringMatrix(data, addIndex = false) {
  const uniqueKeys = new Set();

  data.forEach((row) => {
    Object.keys(row).forEach((key) => uniqueKeys.add(key));
  });

  const keys = Array.from(uniqueKeys);

  if (addIndex) {
    keys.unshift("(I)");
  }

  const dataAsArray = data.map((row, index) =>
    keys.map((key, keyIndex) => {
      let valueToFormat = row[key];

      if (addIndex && keyIndex === 0) {
        valueToFormat = index + 1;
      }

      // Making it look good with colors
      return util.inspect(valueToFormat, undefined, undefined, colorEnabled);
    })
  );

  return { head: keys, matrix: dataAsArray };
}

function logTable(data) {
  // Not used console.table as it output '[Object]' on large nested objects

  const { head, matrix } = convertArrayOfObjectsToStringMatrix(data);

  const table = new Table({ head: head });

  table.push(...matrix);

  console.log(stripColors(table.toString()));
}

module.exports = {
  logger: debug("app"),
  logTable,
};
