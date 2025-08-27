import fs from "fs";
import path from "path";
import assert from "assert";
import { 
  createLogger, 
  createFileTransport, 
  createRotatingFileTransport, 
  defaultScrubber 
} from "../index.js";

// --- Test Setup ---
const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
const testLogFile = path.join(logDir, "test.log");

// Clear previous log
if (fs.existsSync(testLogFile)) fs.unlinkSync(testLogFile);

// --- Create Logger ---
const logger = createLogger({
  transports: [
    { transport: async (level, log) => console.log("Console:", level, log.message), level: "debug" },
    { transport: createFileTransport(testLogFile), level: "info" },
  ],
});

// --- Test Cases ---
async function runTests() {
  console.log("Starting logger tests...");

  // 1️⃣ Log a simple string
  logger.info("Hello World");
  logger.debug("Debug message"); // should appear only on console

  // 2️⃣ Log an object
  logger.warn({ message: "Warning!", actor: "tester", object: "unit" });

  // 3️⃣ Log an error
  const err = new Error("Something went wrong");
  logger.error(err);

  // 4️⃣ Log with metadata
  logger.info("With metadata", { userId: 123, session: "abc" });

  // 5️⃣ Child logger
  const child = logger.child({ service: "childService" });
  child.info("Child logger test");

  // Wait a moment to ensure file writes complete
  await new Promise(res => setTimeout(res, 200));

  // 6️⃣ Check file contents
  const logFileContents = fs.readFileSync(testLogFile, "utf-8");
  assert(logFileContents.includes("Hello World"), "File should contain 'Hello World'");
  assert(!logFileContents.includes("Debug message"), "File should NOT contain debug message");
  assert(logFileContents.includes("Warning!"), "File should contain 'Warning!'");
  assert(logFileContents.includes("Something went wrong"), "File should contain error message");
  assert(logFileContents.includes("With metadata"), "File should contain metadata message");
  assert(logFileContents.includes("Child logger test"), "File should contain child logger message");

  console.log("All logger tests passed!");
}

// Run tests
runTests().catch(err => {
  console.error("Logger tests failed:", err);
});
