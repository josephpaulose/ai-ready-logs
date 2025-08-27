
***

# ai-ready-logs

**AI-optimized, structured logging for Node.js**
Semantic logs for humans, machines, and LLMs.

***

## Features

- **Structured JSON logs** for pipelines, files, and analytics.
- **Colored console output** for easy local development.
- **AI-ready schema** with fields: `timestamp`, `level`, `message`, `event`, `actor`, `object`, `metadata`.
- **Sensitive data redaction** for secrets, tokens, keys, and more.
- **Sanitization** against log forging, newlines, and ANSI/control codes.
- **File log rotation \& gzip compression** (size or daily).
- **Custom log levels \& multiple transports**.
- **Zero external dependencies**—works anywhere Node.js runs.
- **Child loggers** for inherited context/meta.

***

## Installation

```bash
npm install ai-ready-logs
```

Requires Node.js v18+.

***

## Quick Start

```js
import { createLogger, prettyConsole } from "ai-ready-logs";
import { createFileTransport } from "ai-ready-logs/lib/file-transport.js";

// File rotation (size-based, daily also supported)
const fileTransport = createFileTransport("./logs/app.log", {
  rotation: "size",        // or "daily"
  maxSize: 2 * 1024 * 1024, // 2MB per file
  maxFiles: 10,            // keep last 10 files
  compress: true           // gzip rotated files
});

const logger = createLogger({
  transports: [
    { transport: prettyConsole, level: "debug" }, // colored console: debug and up
    { transport: fileTransport,    level: "info" } // files: info and up
  ]
});

// Logging
logger.info("User login", { actor: "user:joe", ip: "192.168.1.1" });
logger.debug("Cache miss", { object: "user:123", ttl: "60s" });
logger.warn({ message: "Disk space low", metadata: { free: "500MB" } });
logger.error("Database error", { object: "db:main", retries: 2 });
```


***

## API \& Usage

### Creating a Logger

```js
import { createLogger } from "ai-ready-logs";

const logger = createLogger({
  transports: [
    // Add one or more transports, each can have a minimum log level.
  ],
  levels: ["trace", "debug", "info", "warn", "error", "fatal"], // optional, add custom
  scrubber: undefined,   // optional, for custom sensitive data redaction
  baseMeta: undefined    // optional, add fields inherited by all logs
});
```


### Transports

- **prettyConsole** – Human-friendly colors, dev only.
- **createFileTransport(path, options)** – Writes JSON logs to the given file (see rotation below).
- **Your custom function/stream** – Any function/stream with `.write()` or `(level,obj)` signature.


### Log Methods

```js
logger.info("Simple message");
logger.warn({ message: "Warn!", event: "SOMEEVENT", metadata: { reason: "why" } });
logger.error("Error with object", { object: "db.example.com", retries: 2 });
logger.debug("Full meta", { actor: "system", event: "DEBUG", details: {...} });
```

Log fields:

- `message`: Main message (string)
- `event`: Short code or event tag
- `actor`: User, system, source, etc.
- `object`: Target or entity affected
- `metadata`: Any structured data (scrubbed for secrets/tokens)


### Child Loggers (Context Inheritance)

```js
const svcLogger = logger.child({ service: "payments" });
svcLogger.info("Started payments engine");
```


### File Transport Options

```js
const fileTransport = createFileTransport("./logs/app.log", {
  rotation: "daily",     // or "size"
  maxSize: 5 * 1024 * 1024, // size in bytes for "size"
  maxFiles: 7,           // max rotated files kept
  compress: true         // gzip rotated logs
});
```


***

## Sensitive Data Redaction

All `metadata` is recursively scanned for secrets and redactable values:

- Keys: `password`, `token`, `secret`, `api_key`, `auth`, etc.
- Patterns: AWS keys, JWTs, credit cards

Custom keys/patterns:

```js
import { createScrubber } from "ai-ready-logs/lib/scrubber.js";
const myScrubber = createScrubber(["private_key"], [/mysecret/i]);
const logger = createLogger({ scrubber: myScrubber });
```


***

## Custom Log Levels

```js
import { getLevels } from "ai-ready-logs/lib/utils.js";
const customLevels = getLevels(["notice", "critical"]);
```


***

## Example Project Structure

```
ai-ready-logs/
├── index.js
├── lib/
│   ├── file-transport.js
│   ├── utils.js
│   └── scrubber.js
├── examples/
│   ├── basic.js
│   ├── simple.js
│   └── logger-example.js
├── logs/         # auto-created
├── package.json
└── cjs-wrapper.js
```


***

## Notes \& Best Practices

- Pass strings for normal logs, or an object for structured logs.
- Always sanitize/scrub logs before sending to untrusted sinks or analytics.
- Multiple transports can run in parallel; file/console/log management is flexible.
- Fully ESM, but CJS-interop supported via `cjs-wrapper.js`.
- Designed for ELK/AI/analytics pipelines and modern Node.js environments.

***

## License

MIT

***

**For working examples, see `examples/` folder in the repo. PRs welcome!**

