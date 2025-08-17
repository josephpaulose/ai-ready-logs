// examples/basic.js
import { createLogger, prettyConsole} from "../index.js";
import { createFileTransport } from "../lib/file-transport.js";

// Create a file transport (logs/app.log)
const fileTransport = createFileTransport("./logs/app.log");

// Create logger with pretty console output + file transport
const logger = createLogger({
  transports: [prettyConsole, fileTransport],
});

// --- Example logs ---
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
  metadata: {
    retries: 3
  }
});

logger.debug({
  message: "Cache miss",
  object: "user:123",
  metadata: {
    ttl: "60s"
  }
});

logger.trace({
  message: "Full request payload",
  metadata: {
    payload: { user: "joe", action: "login" }
  }
});

logger.fatal({
  message: "Critical system failure",
  object: "server-1",
  metadata: {
    reason: "out of memory"
  }
});

console.log("✅ Logging test completed");
