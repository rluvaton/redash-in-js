import { sleep } from "./utils.js";
import { envs, US_1, US_2, EU_3, EU_2 } from "./all-envs.js";
import envConfig from './env.js';

import {logger} from './logger/index.js';

const log = logger.extend("api");
const cleanupLogger = log.extend("cleanup");

const ENVS = {
  [US_1]: {
    ...envConfig[US_1],
    currentlyRunningJobs: new Set(),
  },
  [US_2]: {
    ...envConfig[US_2],
    currentlyRunningJobs: new Set(),
  },
  [EU_3]: {
    ...envConfig[EU_3],
    currentlyRunningJobs: new Set(),
  },
  [EU_2]: {
    ...envConfig[EU_2],
    currentlyRunningJobs: new Set(),
  },
};

// cleanup before exit
const signals = [
  "SIGHUP",
  "SIGINT",
  "SIGQUIT",
  "SIGILL",
  "SIGTRAP",
  "SIGABRT",
  "SIGBUS",
  "SIGFPE",
  "SIGUSR1",
  "SIGSEGV",
  "SIGUSR2",
  "SIGTERM",

  // not a signal
  "exit",
];
signals.forEach(function (sig) {
  process.on(sig, function (...args) {
    let exitCode = 1;

    if (sig === "SIGINT") {
      exitCode = args[1];
    }
    if (sig === "exit") {
      exitCode = args[0];
    }

    cleanupBeforeExit().finally(() => {
      process.exit(exitCode);
    });
  });
});

async function cleanupBeforeExit() {
  cleanupLogger(`Running cleanup`);
  const ignoreMe = Symbol("ignoreMe");

  const results = await Promise.allSettled(
    envs.flatMap((env) => {
      const { currentlyRunningJobs } = ENVS[env];

      const logger = cleanupLogger.extend(env);
      if (currentlyRunningJobs.size === 0) {
        logger(`no pending jobs`);
        return ignoreMe;
        return;
      }

      logger(`found ${currentlyRunningJobs.size} jobs running`);

      return Array.from(currentlyRunningJobs).map((jobId) =>
        cancelQuery(env, jobId, logger.extend(jobId)).then((res) => {
          currentlyRunningJobs.delete(jobId);
          return res;
        })
      );
    })
  );

  const cleanedResults = results.filter(
    (item) => !(item.status === "fulfilled" && item.value === ignoreMe)
  );
  const failures = cleanedResults.filter((item) => item.status === "rejected");

  if (cleanedResults.length > 0) {
    cleanupLogger("cancel results %O", cleanedResults);
  }

  if (failures.length) {
    console.error("some of the jobs failed", {
      failures: failures,
      runningQueries: {
        [US_1]: ENVS[US_1].currentlyRunningJobs,
        [US_2]: ENVS[US_2].currentlyRunningJobs,
        [EU_2]: ENVS[EU_2].currentlyRunningJobs,
        [EU_3]: ENVS[EU_3].currentlyRunningJobs,
      },
    });
  }

  cleanupLogger("Clean up finish!");
}

function getAuthHeaders(env) {
  const { apiKey } = ENVS[env];

  return {
    Authorization: `Key ${apiKey}`,
  };
}

async function getDataSources(env) {
  const { baseUrl } = ENVS[env];

  const res = await fetch(`${baseUrl}/api/data_sources`, {
    headers: getAuthHeaders(env),
    body: null,
    method: "GET",
  });

  const data = await res.json();

  log.extend(env)(`getDataSources %O`, data);

  return data;
}

async function cancelQuery(env, jobId, logger = log) {
  logger(`cancelQuery cancelling job`);

  const { baseUrl } = ENVS[env];

  const res = await fetch(`${baseUrl}/api/jobs/${jobId}`, {
    method: "DELETE",
    headers: getAuthHeaders(env),
    body: null,
  });

  const data = await res.json();

  if (res.status < 400) {
    logger(`cancelQuery job cancelled successfully`);
  } else {
    console.error(`[${env}] cancelQuery failed canceling job`, {
      env,
      status: res.status,
      jobId,
      data,
    });
  }
}

async function createQueryJob(
  env,
  query,
  { applyAutoLimit = true, logger = log } = {}
) {
  const { baseUrl, dataSourceId, currentlyRunningJobs } = ENVS[env];

  const res = await fetch(`${baseUrl}/api/query_results`, {
    method: "POST",
    headers: getAuthHeaders(env),
    body: JSON.stringify({
      data_source_id: dataSourceId,
      parameters: {},
      apply_auto_limit: applyAutoLimit,
      max_age: 0,
      query,
    }),
  });

  const data = await res.json();

  if (data.job.error) {
    console.error(
      `[${env}] createQueryJob Got error in job response: ${data.job.error}`,
      {
        data,
        env,
        jobId,
      }
    );

    throw new Error(data.job.error);
  }

  const jobId = data.job.id;

  if (jobId != null) {
    logger(`createQueryJob adding to currently running jobs (${jobId})`);
    currentlyRunningJobs.add(jobId);
  }

  return jobId;
}

async function getQueryJobResultId(env, jobId, { logger = log } = {}) {
  const { baseUrl, currentlyRunningJobs } = ENVS[env];

  const res = await fetch(`${baseUrl}/api/jobs/${jobId}`, {
    method: "GET",
    headers: getAuthHeaders(env),
    body: null,
  });

  const data = await res.json();

  logger(`getQueryJobResultId %O`, data);
  if (data.job.error) {
    console.error(
      `[${env}] getQueryJobResultId Got error in job response: ${data.job.error}`,
      {
        data,
        env,
        jobId,
      }
    );

    throw new Error(data.job.error);
  }

  const queryResultId = data.job.query_result_id;

  if (queryResultId != null) {
    logger(`getQueryJobResultId remove from currently running jobs`);
    currentlyRunningJobs.delete(jobId);
  }

  return queryResultId;
}

async function waitForQueryJobResultId(env, jobId, { logger = log } = {}) {
  let maxTries = Infinity;
  let currentTry = 1;
  logger(`waitForQueryJobResultIdWaiting for query job result id`);

  let result = await getQueryJobResultId(env, jobId, { logger });

  while (currentTry !== maxTries && result == null) {
    logger(
      `waitForQueryJobResultId query job result id not available yet retrying (try ${++currentTry} out of ${maxTries}) %O`
    );
    await sleep(500);

    result = await getQueryJobResultId(env, jobId, { logger });
  }

  // Reached max tries
  if (result == null) {
    console.warn(
      `[${env}] waitForQueryJobResultId reached max tries (${maxTries}) for querying job result id, cancelling`,
      {
        env,
        jobId,
      }
    );

    await cancelQuery(env, jobId, logger);

    throw new Error("query cancelled");
  }

  return result;
}

async function getQueryResult(env, resultId, { logger = log } = {}) {
  const { baseUrl } = ENVS[env];

  const res = await fetch(`${baseUrl}/api/query_results/${resultId}`, {
    method: "GET",
    headers: getAuthHeaders(env),
    body: null,
  });

  const data = await res.json();

  logger(`getQueryResult data %O`, data);

  logger(`getQueryResult got result for query %O`, {
    size: data?.query_result?.data?.rows?.length,
    query: data?.query_result?.query,
  });

  return data?.query_result?.data?.rows;
}

export async function runQuery(env, query, { applyAutoLimit = true } = {}) {
  let logger = log.extend(env);

  logger(`runQuery running query %O`, {
    query,
  });
  applyAutoLimit = false;

  const jobId = await createQueryJob(env, query, {
    applyAutoLimit,
    logger,
  });

  logger = logger.extend(jobId);
  const resultId = await waitForQueryJobResultId(env, jobId, { logger });
  const result = await getQueryResult(env, resultId, { logger });

  if (result?.length === 1000 && applyAutoLimit) {
    console.warn(
      `[${env}] runQuery got exactly 1000 records and apply limit is active there may be more`,
      {
        query,
      }
    );
  }

  return result;
}

export async function runQueryInAllEnvs(
  query,
  { applyAutoLimit = true, ...restOfOptions } = {}
) {
  return Promise.all(
    envs.map(async (env) => ({
      env: env,
      result: await runQuery(env, query, {
        applyAutoLimit,
        ...restOfOptions,
      }),
    }))
  );
}
