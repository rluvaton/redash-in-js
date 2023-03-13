import { runQuery } from "./api.js";
import { envs as ENVS } from "./all-envs.js";

async function run() {
  await Promise.all(
    ENVS.map(async (env) => {
      const [
        something,
        table2,
      ] = await Promise.all([
        runQuery(env, 'select * from something', {
          applyAutoLimit: false,
        }),
        runQuery(
          env,
          "select * from table2",
          {
            applyAutoLimit: false,
          }
        ),
      ]);

      console.log("");
      console.log("");
      console.log("");
      console.log("");
      console.log("");

      console.log(env, {
        something: something.length,
        table2: table2.length,
      });
    })
  );
}

run()
  .then((result) => console.log("success", result))
  .catch((error) => console.error("Failed with", error));
