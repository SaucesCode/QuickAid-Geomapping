/**
 * Date formatting utilities for analytics pages.
 * Consolidates date formatting logic from Trends, Budget, and other analytics pages.
 */

/**
 * Format date as "MMM YYYY" (e.g., "Jan 2024")
 */
export function formatMonthYear(date) {
  if (!date) return "";
  try {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  } catch (e) {
    return "";
  }
}

/**
 * Format date as "MMM DD" (e.g., "Jan 15")
 */
export function formatShortDate(date) {
  if (!date) return "";
  try {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch (e) {
    return "";
  }
}

/**
 * Format date as full date string (e.g., "1/15/2024")
 */
export function formatLongDate(date) {
  if (!date) return "";
  try {
    return new Date(date).toLocaleDateString();
  } catch (e) {
    return "";
  }
}

/**
 * Format date as ISO string (YYYY-MM-DD)
 */
export function formatISODate(date) {
  if (!date) return "";
  try {
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  } catch (e) {
    return "";
  }
}

/**
 * Format year as string
 */
export function formatYear(date) {
  if (!date) return "";
  try {
    return new Date(date).getFullYear().toString();
  } catch (e) {
    return "";
  }
}
