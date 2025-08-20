// examples/logger-example.js
import { createLogger , prettyConsole } from "../index.js";
import { createFileTransport } from "../lib/file-transport.js";

// Create logger with console + file transport
const logger = createLogger({
  transports: [
    prettyConsole,
    createFileTransport("app.log"), // <-- writes to ./examples/app.log
  ],
});

// --- Normal Log Examples ---
logger.info("Server started successfully");
logger.debug({
  message: "User fetched",
  event: "FETCH_USER",
  actor: "system",
  object: "user:123",
});
logger.warn({
  message: "Disk space low",
  metadata: { free: "500MB", total: "1TB" },
});

// --- Malicious Data Tests ---
logger.error({
  message: "Attack attempt\nInjected new line", // newline injection
  event: "\x1b[31mALERT\x1b[0m", // ANSI escape code injection
  actor: "<script>alert('xss')</script>", // XSS injection
  object: "user:456",
  metadata: {
    payload: "{ \"malicious\": \"\x07\x1b[5mBEEP\x1b[0m\" }", // non-printable + ANSI
  },
});

logger.info({
  message: "SQL injection attempt",
  event: "LOGIN",
  actor: "user'; DROP TABLE users;--",
  object: "db",
  metadata: {
    query: "SELECT * FROM users WHERE name = 'admin' --",
  },
});
