import { createLogger, prettyConsole } from "../index.js";
import { createFileTransport } from "../lib/file-transport.js";

const fileTransport = createFileTransport("./logs/app.log");
const logger = createLogger({ transports: [prettyConsole, fileTransport] });

logger.info("User login attempt", { actor: "user:joe", ip: "192.168.1.1", reason: "invalid password" });
logger.warn("API rate limit approaching", { actor: "service:auth", endpoint: "/login", limit: 100 });
logger.error("Database connection failed", { object: "db.example.com", retries: 3 });
logger.debug("Cache miss", { object: "user:123", ttl: "60s" });
logger.trace("Full request payload", { payload: { user: "joe", action: "login" } });
logger.fatal("Critical system failure", { object: "server-1", reason: "out of memory" });

console.log("✅ Logging test completed");
