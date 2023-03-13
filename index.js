import "dotenv/config"
import { envs as ALL_ENVS } from "./all-envs.js";
import { runQueryInAllEnvs, runQuery } from "./api.js";
import { logTable, logError, logWarning } from "./logger/index.js";

// Env vars:
// - `ENV` - Limit to single env
// - `DEBUG` - turn on debugging
// - `COLORS_DISABLED` - disabled coloring in output
// - `TABLE_TYPE` - 'console' (which is the default) or 'markdown'
// - `VALUE_TRUNK_DISABLED` - don't trunk the object when it's too deep (you won't see Object object or something similar)

const query = process.argv[2] || "select * from deprecated_alert_types";
const env = getEnv();

(env
  ? runQuery(env, query).then((result) => printResultOfSingleEnv(env, result))
  : runQueryInAllEnvs(query).then((results) =>
      results.map(({ env: queriedEnv, result }) => {
        printResultOfSingleEnv(queriedEnv, result);
      })
    )
).catch((error) => console.error("Failed with", error));

function printResultOfSingleEnv(queriedEnv, result) {
  console.log("");
  console.log(queriedEnv);
  console.log("--------------------");

  logTable(result, process.env.TABLE_TYPE);
}

function getEnv() {
  let selectedEnv = process.env.ENV;
  if (!selectedEnv) {
    return undefined;
  }

  if (ALL_ENVS.includes(selectedEnv)) {
    return selectedEnv;
  }

  // Empty line before
  console.log('');
  logWarning(
    `The requested env ('${selectedEnv}') does not exist, possible values are: ${ALL_ENVS.map(
      (possibleEnv) => `"${possibleEnv}"`
    ).join(", ")}`
  );

  selectedEnv = selectedEnv.toUpperCase().trim();

  if (ALL_ENVS.includes(selectedEnv)) {
    console.log(`Guessed you meant env (${selectedEnv}), using it`);
    return selectedEnv;
  }

  selectedEnv = selectedEnv.replace(/-/g, "_");

  if (ALL_ENVS.includes(selectedEnv)) {
    console.log(`Guessed you meant env (${selectedEnv}), using it`);
    return selectedEnv;
  }

  selectedEnv = selectedEnv.replace(/([a-zA-Z]+)([0-9])/g, "$1_$2");

  if (ALL_ENVS.includes(selectedEnv)) {
    console.log(`### Guessed you meant env (${selectedEnv}), using it ###\n`);
    return selectedEnv;
  }

  logError(
    `was not able to guess the environment wanted, exiting`
  );

  process.exit(1);
}
