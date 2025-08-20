import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createLogger, prettyConsole } from "../index.js";
import { createFileTransport } from "../lib/file-transport.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Absolute log file path
const logFilePath = path.join(__dirname, "logs/test.log");

// Clean previous log file
if (fs.existsSync(logFilePath)) fs.unlinkSync(logFilePath);

// Initialize logger with file + console transports
const logger = createLogger({
  transports: [
    prettyConsole,
    createFileTransport(logFilePath),
  ],
  levels: ["info", "warn", "error", "debug"],
});

// 50+ chaotic entries
const entries = [
  { message: "User login attempt", actor: "user:joe", metadata: { ip: "192.168.1.1", password: "1234" } },
  { message: "API rate limit approaching", event: "/login", actor: "service:auth", metadata: { limit: 100 } },
  { message: "Database connection failed", object: "db.example.com", metadata: { retries: 3, token: "abcd" } },
  { message: "Cache miss", object: "user:123", metadata: { ttl: "60s" } },
  { message: "Full request payload", metadata: { payload: { user: "joe", action: "login", api_key: "xyz" } } },
  { message: "Critical system failure", object: "server-1", metadata: { reason: "out of memory" } },
  { message: "File upload completed", actor: "user:alice", metadata: { file: "report.pdf", size: "2MB" } },
  { message: "Unauthorized access attempt", actor: "user:hacker", metadata: { ip: "10.0.0.1", token: "hack" } },
  { message: "Payment succeeded", actor: "user:bob", metadata: { amount: 199.99, method: "credit card" } },
  { message: "Payment failed", actor: "user:charlie", metadata: { amount: 49.99, reason: "insufficient funds" } },
  { message: "Email sent", actor: "system:mailer", metadata: { recipient: "joe@example.com" } },
  { message: "Email failed", actor: "system:mailer", metadata: { recipient: "fail@example.com", secret: "email_secret" } },
  { message: "Background job started", metadata: { jobId: 12345 } },
  { message: "Background job completed", metadata: { jobId: 12345, duration: "12s" } },
  { message: "Config reload", actor: "system", metadata: { file: "config.json" } },
  { message: "Disk space warning", object: "/var/log", metadata: { free: "1GB" } },
  { message: "User logout", actor: "user:joe" },
  { message: "Password changed", actor: "user:alice", metadata: { newPassword: "supersecret" } },
  { message: "Session expired", actor: "user:joe" },
  { message: "New user registered", actor: "user:newbie", metadata: { email: "newbie@example.com", token: "signup-token" } },
  { message: "OAuth token refreshed", actor: "system:auth", metadata: { token: "abcd1234" } },
  { message: "Server restarted", object: "server-2" },
  { message: "Memory leak detected", object: "process-12", metadata: { usage: "1.2GB" } },
  { message: "CPU overload", object: "server-3", metadata: { load: 95 } },
  { message: "Unauthorized API call", actor: "service:unknown", metadata: { endpoint: "/admin", token: "secret" } },
  { message: "Cache cleared", object: "user-session" },
  { message: "Backup completed", metadata: { file: "backup.tar.gz", size: "500MB" } },
  { message: "Backup failed", metadata: { file: "backup.tar.gz", error: "disk full" } },
  { message: "Feature flag enabled", metadata: { feature: "beta-test" } },
  { message: "Feature flag disabled", metadata: { feature: "legacy-ui" } },
  { message: "Webhook received", metadata: { source: "stripe", payload: { amount: 1000, currency: "USD", token: "webhook-key" } } },
  { message: "Webhook processing failed", metadata: { error: "timeout", retry: 3 } },
  { message: "New comment added", actor: "user:bob", metadata: { commentId: 567, text: "Nice post!" } },
  { message: "Comment deleted", actor: "user:admin", metadata: { commentId: 567 } },
  { message: "Search query executed", metadata: { query: "nodejs logger", results: 42 } },
  { message: "Cache warmup", metadata: { keys: ["user:1", "user:2", "session:123"] } },
  { message: "API v2 deprecated", metadata: { endpoint: "/v2/*" } },
  { message: "Session hijack attempt", actor: "user:unknown", metadata: { ip: "203.0.113.10", token: "evil" } },
  { message: "Login throttled", actor: "user:joe", metadata: { attempts: 5 } },
  { message: "File deleted", actor: "user:alice", metadata: { file: "old.log" } },
  { message: "New subscription", actor: "user:charlie", metadata: { plan: "premium" } },
  { message: "Subscription cancelled", actor: "user:charlie", metadata: { plan: "premium", reason: "non-payment" } },
  { message: "Alert triggered", metadata: { level: "high", source: "monitoring" } },
  { message: "Debug info", metadata: { debug: true, payload: { password: "123" } } },
  { message: "Trace execution", metadata: { step: "validateInput", value: "test" } },
  { message: "Fatal error", metadata: { code: 500, message: "Segfault" } },
  { message: "System shutdown", metadata: { reason: "maintenance" } },
  { message: "Node added to cluster", metadata: { nodeId: "node-7" } },
  { message: "Node removed from cluster", metadata: { nodeId: "node-3" } },
  { message: "Config validation failed", metadata: { file: "config.json", errors: ["missing key", "invalid format"] } },
  { message: "Long running job", metadata: { jobId: 999, duration: "2h" } },
];

// Log all entries
entries.forEach((entry) => {
  const level = ["info", "warn", "error", "debug"][Math.floor(Math.random() * 4)];
  logger[level](entry);
});

// Wait for streams to flush, then read file
setTimeout(() => {
  if (fs.existsSync(logFilePath)) {
    const content = fs.readFileSync(logFilePath, "utf-8");
    console.log("\n--- Log file content preview ---\n");
    console.log(content.split("\n").slice(0, 20).join("\n")); // preview first 20 lines
    console.log("\nTest complete. Check the full log at:", logFilePath);
  } else {
    console.error("Log file not found:", logFilePath);
  }
}, 200);
