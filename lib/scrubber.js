/**
 * Default scrubber for metadata and logs.
 * Redacts sensitive values like passwords, tokens, secrets, and keys.
 */

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
 * Recursively scrub sensitive values from an object or array
 * @param {any} data
 * @param {string[]} sensitiveKeys
 * @returns {any}
 */
function deepScrub(data, sensitiveKeys) {
  if (Array.isArray(data)) {
    return data.map((item) => deepScrub(item, sensitiveKeys));
  }

  if (data && typeof data === "object") {
    const scrubbed = {};
    for (const [k, v] of Object.entries(data)) {
      if (isSensitiveKey(k, sensitiveKeys)) {
        scrubbed[k] = "[REDACTED]";
      } else {
        scrubbed[k] = deepScrub(v, sensitiveKeys);
      }
    }
    return scrubbed;
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

  return deepScrub(meta, sensitiveKeys);
}

/**
 * Create a custom scrubber with user-provided sensitive keys
 * @param {string[]} customKeys
 * @returns {(meta: Record<string, any>) => Record<string, any>}
 */
export function createScrubber(customKeys = []) {
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
    const sensitiveKeys = [...new Set([...baseKeys, ...customKeys.map((k) => k.toLowerCase())])];
    return deepScrub(meta, sensitiveKeys);
  };
}
