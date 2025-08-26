import { createFileTransport, createRotatingFileTransport } from "./lib/file-transport.js";
import { getTimestamp, getLevels, defaultLevels } from "./lib/utils.js";
import { defaultScrubber, createScrubber } from "./lib/scrubber.js";

// --- Sanitizer ---
function sanitize(input) {
  if (input === null || input === undefined) return "";
  if (typeof input !== "string") return input;

  return input
    .replace(/[\r\n]+/g, " ")          // prevent multi-line injection
    .replace(/\x1b\[[0-9;]*m/g, "")    // strip ANSI codes
    .replace(/[^\x20-\x7E]+/g, "");    // strip non-printable chars
}

// --- JSON formatter ---
function formatJSON({ level, message, event, actor, object, metadata }, scrubber) {
  let safeMeta = {};
  try {
    safeMeta = metadata ? scrubber(metadata) : {};
  } catch {
    safeMeta = { invalid_metadata: true };
  }

  return {
    timestamp: getTimestamp(),
    level: sanitize(level),
    message: sanitize(message),
    event: sanitize(event),
    actor: sanitize(actor),
    object: sanitize(object),
    metadata: safeMeta,
  };
}

// --- Pretty console transport ---
export function prettyConsole(level, logObj) {
  const colors = {
    info: "\x1b[36m",   // cyan
    warn: "\x1b[33m",   // yellow
    error: "\x1b[31m",  // red
    debug: "\x1b[35m",  // magenta
    trace: "\x1b[90m",  // gray
    fatal: "\x1b[41m",  // red background
  };
  const reset = "\x1b[0m";
  const color = colors[level] || "\x1b[37m";

  console.log(
    `${color}[${logObj.timestamp}] ${level.toUpperCase()}: ${logObj.message}${reset}`
  );

  if (logObj.event || logObj.actor || logObj.object) {
    console.log(
      `   event: ${logObj.event || "-"} | actor: ${logObj.actor || "-"} | object: ${logObj.object || "-"}`
    );
  }

  if (logObj.metadata && Object.keys(logObj.metadata).length > 0) {
    console.log("   metadata:", JSON.stringify(logObj.metadata, null, 2));
  }
}

// --- Logger Factory with per-transport levels ---
export function createLogger(options = {}) {
  const {
    transports = [
      { transport: prettyConsole, level: "debug" },  // console shows debug+
      { transport: createRotatingFileTransport("logs/app.log", { maxSize: 100*1024, maxFiles: 5, compress: true }), level: "info" }, // file shows info+
    ],
    levels = defaultLevels,
    scrubber = defaultScrubber,
    baseMeta = {},
  } = options;

  const allLevels = getLevels(levels);

  async function log(level, { message = "", event = "", actor = "", object = "", metadata = {} } = {}) {
    let msg = message;
    let meta = { ...metadata };
    if (message instanceof Error) {
      msg = message.message;
      meta.stack = message.stack;
    }

    const logObj = formatJSON(
      { level, message: msg, event, actor, object, metadata: { ...baseMeta, ...meta } },
      scrubber
    );

  await Promise.all(
    transports.map(async (entry) => {
      try {
        let transport, minLevel;

        // Support both `{ transport, level }` and raw function/object
        if (typeof entry === "function" || (entry && typeof entry.write === "function")) {
          transport = entry;
          minLevel = "info"; // default
        } else if (entry && typeof entry === "object" && entry.transport) {
          transport = entry.transport;
         minLevel = entry.level || "info";
        } else {
          console.error("Invalid transport entry:", entry);
          return;
        }

        // Skip if below minLevel
       if (defaultLevels.indexOf(level) < defaultLevels.indexOf(minLevel)) return;

        if (typeof transport === "function") {
          await transport(level, logObj);
       } else if (transport && typeof transport.write === "function") {
         await transport.write(JSON.stringify(logObj) + "\n");
        } else {
         console.error("Invalid transport handler:", transport);
       }
      } catch (err) {
        console.error("Transport error:", err);
      }
    })
  );
}

  const logger = {};
  allLevels.forEach((lvl) => {
    logger[lvl] = (messageOrObj, meta = {}) => {
      if (typeof messageOrObj === "string" || messageOrObj instanceof Error) {
        const { event = "", actor = "", object = "", ...rest } = meta;
        log(lvl, { message: messageOrObj, event, actor, object, metadata: rest });
      } else if (typeof messageOrObj === "object" && messageOrObj !== null) {
        const { message = "", event = "", actor = "", object = "", ...rest } = messageOrObj;
        log(lvl, { message, event, actor, object, metadata: rest });
      }
    };
  });

  // child logger with inherited meta
  logger.child = (childMeta = {}) => {
    return createLogger({
      ...options,
      baseMeta: { ...baseMeta, ...childMeta },
    });
  };

  return logger;
}

// --- Public Exports ---
export {
  createFileTransport,
  createRotatingFileTransport,
  defaultScrubber,
  createScrubber,
};
