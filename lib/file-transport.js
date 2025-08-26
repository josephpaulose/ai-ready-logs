import fs from "fs";
import path from "path";
import zlib from "zlib";

/**
 * File transport with optional log rotation, maxFiles, and compression
 * @param {string} filePath - Path to the log file
 * @param {object} options
 * @param {"daily"|"size"} [options.rotation="daily"] - Rotation type
 * @param {number} [options.maxSize=5*1024*1024] - Max size in bytes (if size rotation)
 * @param {number} [options.maxFiles=5] - Maximum rotated files to keep
 * @param {boolean} [options.compress=false] - Compress old files with gzip
 */
export function createFileTransport(filePath, options = {}) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const rotation = options.rotation || "daily";
  const maxSize = options.maxSize || 5 * 1024 * 1024;
  const maxFiles = options.maxFiles || 5;
  const compress = options.compress || false;

  let currentDate = getDateString();
  let stream = fs.createWriteStream(filePath, { flags: "a" });

  function getDateString() {
    const d = new Date();
    return d.toISOString().split("T")[0]; // YYYY-MM-DD
  }

  function compressFile(file) {
  return new Promise((resolve, reject) => {
    const gzip = zlib.createGzip();
    const input = fs.createReadStream(file);
    const output = fs.createWriteStream(file + ".gz");
    input.pipe(gzip).pipe(output)
      .on("close", () => {
        fs.unlink(file, () => resolve());
      })
      .on("error", reject);
  });
}

  function cleanupOldFiles() {
  const base = path.basename(filePath);
  const files = fs.readdirSync(dir)
    .filter(f => f.startsWith(base + "."))
    .map(f => path.join(dir, f))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);

  while (files.length > maxFiles) {
    const oldFile = files.pop();
    try { fs.unlinkSync(oldFile); } catch {}
  }
}

  function rotateIfNeeded() {
    if (rotation === "daily") {
      const today = getDateString();
      if (today !== currentDate) {
        stream.end();
        const rotatedPath = `${filePath}.${currentDate}`;
        if (fs.existsSync(filePath)) fs.renameSync(filePath, rotatedPath);
        if (compress) compressFile(rotatedPath);
        cleanupOldFiles();
        stream = fs.createWriteStream(filePath, { flags: "a" });
        currentDate = today;
      }
    } else if (rotation === "size") {
      try {
        const stats = fs.statSync(filePath);
        if (stats.size >= maxSize) {
          stream.end();
          let counter = 1;
          let rotatedPath;
          do {
            rotatedPath = `${filePath}.${counter}`;
            counter++;
          } while (fs.existsSync(rotatedPath));
          fs.renameSync(filePath, rotatedPath);
          if (compress) compressFile(rotatedPath);
          cleanupOldFiles();
          stream = fs.createWriteStream(filePath, { flags: "a" });
        }
      } catch {
        // file might not exist yet
      }
    }
  }

  return {
    write: (logEntry) => {
      rotateIfNeeded();
      stream.write(logEntry + "\n");
    },
  };
}

// Alias for backwards compatibility
export const createRotatingFileTransport = createFileTransport;
