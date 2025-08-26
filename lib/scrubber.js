// lib/scrubber.js

/**
 * Check if a key name looks sensitive
 * @param {string} key
 * @param {string[]} sensitiveKeys
 * @returns {boolean}
 */
function isSensitiveKey(key, sensitiveKeys) {
  return sensitiveKeys.some((s) => key.toLowerCase().includes(s));
}

/**
 * Check if a value matches any sensitive regex
 * @param {any} value
 * @param {RegExp[]} regexRules
 * @returns {boolean}
 */
function matchesSensitiveRegex(value, regexRules) {
  if (typeof value !== "string") return false;
  return regexRules.some((r) => r.test(value));
}

/**
 * Recursively scrub sensitive values from an object or array
 * @param {any} data
 * @param {string[]} sensitiveKeys
 * @param {RegExp[]} regexRules
 * @returns {any}
 */
function deepScrub(data, sensitiveKeys, regexRules) {
  if (Array.isArray(data)) {
    return data.map((item) => deepScrub(item, sensitiveKeys, regexRules));
  }

  if (data && typeof data === "object") {
    const scrubbed = {};
    for (const [k, v] of Object.entries(data)) {
      if (isSensitiveKey(k, sensitiveKeys) || matchesSensitiveRegex(v, regexRules)) {
        scrubbed[k] = "[REDACTED]";
      } else {
        scrubbed[k] = deepScrub(v, sensitiveKeys, regexRules);
      }
    }
    return scrubbed;
  }

  if (matchesSensitiveRegex(data, regexRules)) {
    return "[REDACTED]";
  }

  return data; // primitive (string, number, boolean, null, undefined)
}

/**
 * Default scrubber
 * @param {Record<string, any>} meta
 * @returns {Record<string, any>}
 */
export function defaultScrubber(meta) {
  if (!meta || typeof meta !== "object") return meta;

  const sensitiveKeys = [
    "password",
    "pass",
    "secret",
    "token",
    "apikey",
    "api_key",
    "key",
    "auth",
    "credential",
  ];

  const regexRules = [
    /\bAKIA[0-9A-Z]{16}\b/, // AWS Access Key
    /\b(?:[A-Za-z0-9-_]{20,}\.[A-Za-z0-9-_]{20,}\.[A-Za-z0-9-_]{20,})\b/, // JWT
    /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/, // Credit Card
  ];

  return deepScrub(meta, sensitiveKeys, regexRules);
}

/**
 * Create a custom scrubber with user-provided sensitive keys & regex rules
 * @param {string[]} customKeys
 * @param {RegExp[]} customRegex
 * @returns {(meta: Record<string, any>) => Record<string, any>}
 */
export function createScrubber(customKeys = [], customRegex = []) {
  return function scrub(meta) {
    if (!meta || typeof meta !== "object") return meta;

    const baseKeys = [
      "password",
      "pass",
      "secret",
      "token",
      "apikey",
      "api_key",
      "key",
      "auth",
      "credential",
    ];

    const baseRegex = [
      /\bAKIA[0-9A-Z]{16}\b/, // AWS Access Key
      /\b(?:[A-Za-z0-9-_]{20,}\.[A-Za-z0-9-_]{20,}\.[A-Za-z0-9-_]{20,})\b/, // JWT
      /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/, // Credit Card
    ];

    const sensitiveKeys = [...new Set([...baseKeys, ...customKeys.map((k) => k.toLowerCase())])];
    const regexRules = [...baseRegex, ...customRegex];

    return deepScrub(meta, sensitiveKeys, regexRules);
  };
}
