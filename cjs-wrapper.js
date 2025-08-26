// cjs-wrapper.js
const { createRequire } = require("module");
const requireESM = createRequire(__filename);

// Import your ESM entrypoint
const esmExports = requireESM("./index.js");

// Export them in CommonJS style
module.exports = esmExports;
