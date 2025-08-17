export const defaultLevels = ["trace","debug","info","warn","error","fatal"];

export function getTimestamp() {
  return new Date().toISOString();
}

export function getLevels(customLevels = []) {
  const merged = [...defaultLevels];
  customLevels.forEach(lvl => {
    if (typeof lvl === "string" && !merged.includes(lvl)) merged.push(lvl);
  });
  return merged;
}
