const { colorEnabled } = require('../helpers');
const util = require('util');

function convertArrayOfObjectsToStringMatrix(data, { addIndex = false, withColors = colorEnabled } = {}) {
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
      return util.inspect(valueToFormat, undefined, undefined, withColors);
    })
  );

  return { head: keys, matrix: dataAsArray };
}

module.exports = {
  convertArrayOfObjectsToStringMatrix,
};
