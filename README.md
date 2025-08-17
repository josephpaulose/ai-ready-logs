
# ai-ready-logs

🚀 AI-optimized logging library for Node.js.  
Structured, semantic logs designed for **humans, machines, and LLMs**.  

---

## ✨ Features
- 📦 **Structured JSON logs** (default output for files)
- 🎨 **Pretty human-readable logs** in console
- 🤖 **AI-ready schema**: actor, object, metadata, event
- 🛡 **Sanitized logs**: prevents log forging, ANSI injection, control chars
- ⚡ Lightweight, **no external npm dependencies** (Node.js built-ins only)
- 📝 **Custom transports**: console, files, or your own transport

---

## 📦 Installation

```bash
npm install ai-ready-logs
```

---

## 🧰 Usage

### Import

```js
import { createLogger } from "ai-ready-logs";
import { createFileTransport } from "ai-ready-logs/lib/file-transport.js";
```

### Create a file transport

```js
const fileTransport = createFileTransport("./logs/app.log");
```

### Create a logger with transports

```js
const logger = createLogger({
  transports: [fileTransport],  // add prettyConsole separately if desired
});
```

### Log examples

> Always pass a single object containing at least `message`. Optional: `actor`, `object`, `metadata`, `event`.

```js
logger.info({
  message: "User login attempt",
  actor: "user:joe",
  metadata: {
    ip: "192.168.1.1",
    reason: "invalid password"
  }
});

logger.warn({
  message: "API rate limit approaching",
  actor: "service:auth",
  metadata: {
    endpoint: "/login",
    limit: 100
  }
});

logger.error({
  message: "Database connection failed",
  object: "db.example.com",
  metadata: { retries: 3 }
});

logger.debug({
  message: "Cache miss",
  object: "user:123",
  metadata: { ttl: "60s" }
});

logger.trace({
  message: "Full request payload",
  metadata: { payload: { user: "joe", action: "login" } }
});

logger.fatal({
  message: "Critical system failure",
  object: "server-1",
  metadata: { reason: "out of memory" }
});
```

---

## 🌈 Pretty Console Output

To enable colored, human-readable logs in console, import `prettyConsole`:

```js
import { prettyConsole } from "ai-ready-logs";

const logger = createLogger({
  transports: [prettyConsole, fileTransport],
});
```

---

## 🔧 File Transport

```js
import { createFileTransport } from "ai-ready-logs/lib/file-transport.js";

const fileTransport = createFileTransport("./logs/app.log");
```

- Writes logs as JSON lines to the specified file.
- Automatically creates the `logs/` directory if missing.

---

## 🛡 Sanitization

- Removes newline characters to prevent log forging
- Strips ANSI escape sequences
- Removes non-printable control characters

---

## 🧩 Custom Log Levels

Default levels: `trace`, `debug`, `info`, `warn`, `error`, `fatal`

You can add custom levels:

```js
import { getLevels } from "ai-ready-logs/lib/utils.js";

const customLevels = getLevels(["notice", "critical"]);
```

---

## 📂 Folder Structure

```
ai-ready-logs/
├─ index.js
├─ lib/
│  ├─ file-transport.js
│  └─ utils.js
├─ examples/
│  └─ basic.js
├─ logs/         # created automatically
└─ package.json
```

---

## 📝 Notes

- Node.js >= 18 recommended
- Fully ESM compatible
- Supports multiple transports simultaneously
- Logs are AI/ELK-ready JSON by default
- Console logs are colorful and human-friendly if `prettyConsole` transport is used
