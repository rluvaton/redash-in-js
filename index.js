require("dotenv").config();
const { runQueryInAllEnvs } = require("./api");
const { logTable } = require("./logger");

// Env vars:
// - `DEBUG` - turn on debugging
// - `COLORS_DISABLED` - disabled coloring in output
// - `TABLE_TYPE` - 'console' (which is the default) or 'markdown'

runQueryInAllEnvs(process.argv[2] || "select * from deprecated_alert_types")
  .then((results) =>
    results.map(({ env, result }) => {
      console.log("");
      console.log(env);
      console.log("--------------------");

      logTable(result, process.env.TABLE_TYPE);
    }),
  )
  .catch((error) => console.error("Failed with", error));
