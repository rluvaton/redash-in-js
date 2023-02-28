const debug = require("debug");
const { logTable } = require("./table");

module.exports = {
  logger: debug("app"),
  logTable,
};
