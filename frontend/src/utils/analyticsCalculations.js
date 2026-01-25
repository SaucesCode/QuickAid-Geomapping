/**
 * Analytics calculation utilities for stat cards and insights.
 * Consolidates calculation patterns from all analytics pages.
 */

/**
 * Calculate total from array of objects
 * @param {Array} data - Array of objects
 * @param {string} field - Field name to sum (default: 'count')
 */
export function calculateTotal(data, field = "count") {
  if (!Array.isArray(data) || data.length === 0) return 0;
  return data.reduce((sum, item) => sum + (Number(item[field]) || 0), 0);
}

/**
 * Find item with maximum value for a field
 * @param {Array} data - Array of objects
 * @param {string} field - Field name to compare (default: 'count')
 * @param {any} defaultValue - Default value if data is empty
 */
export function findMax(data, field = "count", defaultValue = null) {
  if (!Array.isArray(data) || data.length === 0) return defaultValue;
  return data.reduce((prev, curr) => {
    const prevVal = Number(prev[field]) || 0;
    const currVal = Number(curr[field]) || 0;
    return currVal > prevVal ? curr : prev;
  }, data[0]);
}

/**
 * Find item with minimum value for a field
 * @param {Array} data - Array of objects
 * @param {string} field - Field name to compare (default: 'count')
 * @param {any} defaultValue - Default value if data is empty
 */
export function findMin(data, field = "count", defaultValue = null) {
  if (!Array.isArray(data) || data.length === 0) return defaultValue;
  return data.reduce((prev, curr) => {
    const prevVal = Number(prev[field]) || 0;
    const currVal = Number(curr[field]) || 0;
    return currVal < prevVal ? curr : prev;
  }, data[0]);
}

/**
 * Calculate average from array of objects
 * @param {Array} data - Array of objects
 * @param {string} field - Field name to average (default: 'count')
 */
export function calculateAverage(data, field = "count") {
  if (!Array.isArray(data) || data.length === 0) return 0;
  const sum = calculateTotal(data, field);
  return Math.round(sum / data.length);
}

/**
 * Calculate growth rate between two values
 * @param {number} current - Current value
 * @param {number} previous - Previous value
 * @param {number} decimals - Number of decimal places (default: 1)
 */
export function calculateGrowthRate(current, previous, decimals = 1) {
  if (!previous || previous === 0) return 0;
  return Number((((current - previous) / previous) * 100).toFixed(decimals));
}

/**
 * Calculate growth rate from array (last vs second-to-last)
 * @param {Array} data - Array of objects with count field
 * @param {string} field - Field name to compare (default: 'count')
 */
export function calculateGrowthRateFromArray(data, field = "count") {
  if (!Array.isArray(data) || data.length < 2) return 0;
  const latest = Number(data[data.length - 1]?.[field]) || 0;
  const previous = Number(data[data.length - 2]?.[field]) || 0;
  return calculateGrowthRate(latest, previous);
}

/**
 * Calculate percentage
 * @param {number} numerator - Numerator
 * @param {number} denominator - Denominator
 * @param {number} decimals - Number of decimal places (default: 1)
 */
export function calculatePercentage(numerator, denominator, decimals = 1) {
  if (!denominator || denominator === 0) return 0;
  return Number(((numerator / denominator) * 100).toFixed(decimals));
}

/**
 * Calculate average from array of numbers
 * @param {Array<number>} numbers - Array of numbers
 */
export function calculateAverageFromNumbers(numbers) {
  if (!Array.isArray(numbers) || numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, num) => acc + (Number(num) || 0), 0);
  return sum / numbers.length;
}

/**
 * Get unique values from array of objects
 * @param {Array} data - Array of objects
 * @param {string} field - Field name to extract
 */
export function getUniqueValues(data, field) {
  if (!Array.isArray(data)) return [];
  return [...new Set(data.map(item => item[field]).filter(Boolean))];
}

/**
 * Safely return the first element of an array
 * @param {Array} data
 * @param {any} defaultValue
 */
export function safeFirst(data, defaultValue = null) {
  return Array.isArray(data) && data.length > 0 ? data[0] : defaultValue;
}

/**
 * Safely return an array or an empty array
 * @param {Array} data
 */
export function safeArray(data) {
  return Array.isArray(data) ? data : [];
}

/**
 * Safely extract a numeric count
 * @param {any} value
 * @param {string} field
 */
export function safeCount(value, field = "count") {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value) || 0;
  if (value && typeof value === "object") return Number(value[field]) || 0;
  return 0;
}

/**
 * Safely return the last element of an array
 * @param {Array} data
 * @param {any} defaultValue
 */
export function safeLast(data, defaultValue = null) {
  return Array.isArray(data) && data.length > 0
    ? data[data.length - 1]
    : defaultValue;
}
