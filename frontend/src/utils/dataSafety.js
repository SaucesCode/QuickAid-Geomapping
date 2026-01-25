/**
 * Data safety utilities for analytics pages.
 * Provides safe access to potentially undefined/null data.
 */

/**
 * Ensure value is an array, return empty array if not
 */
export function safeArray(data) {
  return Array.isArray(data) ? data : [];
}

/**
 * Get value from object path safely
 * @param {any} data - The data object
 * @param {string|string[]} path - Dot-separated path or array of keys
 * @param {any} defaultValue - Value to return if path doesn't exist
 */
export function safeGet(data, path, defaultValue = null) {
  if (data == null) return defaultValue;
  
  const keys = Array.isArray(path) ? path : path.split(".");
  let current = data;
  
  for (const key of keys) {
    if (current == null || typeof current !== "object") {
      return defaultValue;
    }
    current = current[key];
  }
  
  return current != null ? current : defaultValue;
}

/**
 * Get array length safely
 */
export function safeCount(data) {
  return Array.isArray(data) ? data.length : 0;
}

/**
 * Get first item from array safely
 */
export function safeFirst(data, defaultValue = null) {
  return Array.isArray(data) && data.length > 0 ? data[0] : defaultValue;
}

/**
 * Get last item from array safely
 */
export function safeLast(data, defaultValue = null) {
  return Array.isArray(data) && data.length > 0 ? data[data.length - 1] : defaultValue;
}

/**
 * Safe number access with default
 */
export function safeNumber(value, defaultValue = 0) {
  if (value == null || isNaN(value)) return defaultValue;
  return Number(value);
}

/**
 * Safe string access with default
 */
export function safeString(value, defaultValue = "") {
  if (value == null) return defaultValue;
  return String(value);
}

/**
 * Check if data exists and has items
 */
export function hasData(data) {
  return Array.isArray(data) && data.length > 0;
}
