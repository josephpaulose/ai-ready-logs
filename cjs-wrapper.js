// cjs-wrapper.js
const path = require("path");
const { createRequire } = require("module");
const requireESM = createRequire(import.meta.url);

// Import ESM index.js
const esmLogger = requireESM(path.join(__dirname, "index.js"));

// Export as CommonJS
module.exports = {
  createLogger: esmLogger.createLogger,
  prettyConsole: esmLogger.prettyConsole,
  createFileTransport: esmLogger.createFileTransport,
};
