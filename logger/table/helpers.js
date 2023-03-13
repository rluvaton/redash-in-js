import { colorEnabled, disableValueTrunk } from '../helpers.js';
import util from 'util';

export function convertArrayOfObjectsToStringMatrix(data, { addIndex = false, withColors = colorEnabled } = {}) {
  const uniqueKeys = new Set();

  data.forEach((row) => {
    Object.keys(row).forEach((key) => uniqueKeys.add(key));
  });

  const keys = Array.from(uniqueKeys);

  if (addIndex) {
    keys.unshift("(I)");
  }

  const inspectOptions = {
    colors: withColors,
  };

  if(disableValueTrunk) {
    // Not setting it to undefined in case disableValueTrunk is false as it will still print it all
    inspectOptions.depth = Infinity;
  }

  const dataAsArray = data.map((row, index) =>
    keys.map((key, keyIndex) => {
      let valueToFormat = row[key];

      if (addIndex && keyIndex === 0) {
        valueToFormat = index + 1;
      }

      // Making it look good with colors
      return util.inspect(valueToFormat, inspectOptions);
    })
  );

  return { head: keys, matrix: dataAsArray };
}
