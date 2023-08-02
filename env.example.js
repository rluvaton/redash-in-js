import { US_1, US_2, EU_3, EU_2 } from "./all-envs.js";

// TODO - rename this to file to env.js

module.exports = {
  [US_1]: {
    baseUrl: "https://dash.com",
    apiKey: "<from-profile>",

    dataSourceName: "US1 Replica",
    dataSourceId: 6,
  },
  [US_2]: {
    baseUrl: "https://redash2.com",
    apiKey: "<from-profile>",

    dataSourceName: "US2 Replica",
    dataSourceId: 4,
  },
  [EU_3]: {
    baseUrl: "https://redash3.com",
    apiKey: "<from-profile>",

    dataSourceName: "EU3 Replica",
    dataSourceId: 1,
  },
  [EU_2]: {
    baseUrl: "https://redash4.com",
    apiKey: "<from-profile>",

    dataSourceName: "EU2 Replica",
    dataSourceId: 4,
  },
};
