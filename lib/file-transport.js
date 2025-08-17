import fs from "fs";
import path from "path";

/**
 * File transport for logger
 * @param {string} filePath
 */
export function createFileTransport(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  return {
    write: (logEntry) => fs.appendFileSync(filePath, logEntry + "\n", "utf8")
  };
}
