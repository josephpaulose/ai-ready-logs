import { createFileTransport } from "./lib/file-transport.js";
import { getTimestamp, getLevels } from "./lib/utils.js";
import { defaultScrubber } from "./lib/scrubber.js";

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
    info: "\x1b[36m",
    warn: "\x1b[33m",
    error: "\x1b[31m",
    debug: "\x1b[35m",
    trace: "\x1b[90m",
    fatal: "\x1b[41m",
  };
  const reset = "\x1b[0m";
  const color = colors[level] || "\x1b[37m";

  console.log(`${color}[${logObj.timestamp}] ${level.toUpperCase()}: ${logObj.message}${reset}`);
}

// --- Main Logger Factory ---
export function createLogger(options = {}) {
  const {
    transports = [prettyConsole, createFileTransport("logs/server.log")],
    levels = ["info", "warn", "error", "debug", "trace", "fatal"],
    scrubber = defaultScrubber,       // allow custom scrubber
  } = options;

  const allLevels = getLevels(levels);

  function log(level, { message = "", event = "", actor = "", object = "", metadata = {} } = {}) {
    const logObj = formatJSON({ level, message, event, actor, object, metadata }, scrubber);

    transports.forEach((t) => {
      try {
        if (typeof t === "function") {
          t(level, logObj);
        } else if (t && typeof t.write === "function") {
          t.write(JSON.stringify(logObj));
        } else {
          console.error("Invalid transport:", t);
        }
      } catch (err) {
        console.error("Transport error:", err);
      }
    });
  }

  const logger = {};
  allLevels.forEach((lvl) => {
    logger[lvl] = (messageOrObj, meta = {}) => {
      if (typeof messageOrObj === "string") {
        const { event = "", actor = "", object = "", ...rest } = meta;
        log(lvl, { message: messageOrObj, event, actor, object, metadata: rest });
      } else if (typeof messageOrObj === "object" && messageOrObj !== null) {
        const { message = "", event = "", actor = "", object = "", ...rest } = messageOrObj;
        log(lvl, { message, event, actor, object, metadata: rest });
      }
    };
  });

  return logger;
}
