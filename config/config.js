"use strict";

/********************************************************************
 * Configuration
 ********************************************************************/

/*eslint no-process-env: "off"*/
module.exports = {
  logging: typeof process.env.ENABLE_LOGGING !== "undefined" || true,
  debug: typeof process.env.ENABLE_DEBUG !== "undefined",
  verbose: typeof process.env.ENABLE_VERBOSE !== "undefined",
  appName: process.env.ORDERS_NAME || "ORDERS_NAME Not Set",
  serverPort: process.env.PORT || 3000
};
