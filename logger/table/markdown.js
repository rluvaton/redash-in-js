const { stripColors } = require('../helpers');


/**
 *
 * @param {string[][]} matrix
 * @return {number[]} Max width per column in the matrix
 */
function calculateMaxWidthPerColumn(matrix) {
  return matrix[0].map((header, columnIndex) => {
    return matrix.reduce((maxLength, row) => {
      return Math.max(maxLength, stripColors(row[columnIndex]).length);
    }, stripColors(header).length);
  });
}

/**
 *
 * @param {string[]} row
 * @param {number[]} maxWidthForEachColumn
 * @return {string[]} padded row
 */
function padRow(row, maxWidthForEachColumn) {
  return row.map((column, index) => {
    const columnLengthWithoutColor = stripColors(column).length;

    return column + ' '.repeat(maxWidthForEachColumn[index] - columnLengthWithoutColor)
  })
}

/**
 * Format table as markdown
 * @param {string[]} head
 * @param {string[][]} matrix
 * @returns {string} Markdown table
 */
function markdownTable(head, matrix) {
  const maxWidthForEachColumn = calculateMaxWidthPerColumn([head].concat(matrix));

  head = padRow(head, maxWidthForEachColumn);
  matrix = matrix.map((row) => padRow(row, maxWidthForEachColumn));

  let table = `| ${head.join(" | ")} |`;
  table += `\n| ${head.map((_, i) => `${'-'.repeat(maxWidthForEachColumn[i])}`).join(" | ")} |\n`;
  table += matrix.map((row) => `| ${row.join(" | ")} |`).join("\n");

  return table;
}

module.exports = {
  markdownTable,
};
