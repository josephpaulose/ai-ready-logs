// lib/file-transport.js
import fs from "fs";
import path from "path";

/**
 * File transport for logger
 * @param {string} filePath
 */
export function createFileTransport(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const stream = fs.createWriteStream(filePath, { flags: "a" });

  return {
    write: (logEntry) => {
      stream.write(logEntry + "\n");
    },
  };
}
