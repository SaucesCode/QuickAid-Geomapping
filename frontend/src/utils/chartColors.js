/**
 * Chart color constants and helper functions for analytics pages.
 * Consolidates color definitions from Performance, DemographicsEconomics, Budget, and Geographic pages.
 */

// =============================================
// BASE COLOR PALETTE
// =============================================

export const COLOR_PRIMARY = "#3B82F6";
export const COLOR_SECONDARY = "#6366F1";
export const COLOR_TERTIARY = "#2563EB";
export const COLOR_ACCENT = "#1D4ED8";
export const COLOR_PINK = "#EC4899";

// Status Colors
export const COLOR_CLAIMED = "#10B981"; // Green
export const COLOR_UNCLAIMED = "#EF4444"; // Red
export const COLOR_SUCCESS = "#10B981";
export const COLOR_DANGER = "#EF4444";
export const COLOR_WARNING = "#FACC15";
export const COLOR_DEFAULT = "#94A3B8";

// =============================================
// CHART COLOR ARRAYS
// =============================================

export const CHART_COLORS = [
  "#1D4ED8", // Blue
  "#3B82F6", // Light Blue
  "#10B981", // Green
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#14B8A6", // Teal
  "#F97316", // Orange
];

export const COLORS = [
  "#EF4444", // Red
  "#F59E0B", // Amber / Yellow
  "#10B981", // Emerald / Green
  "#3B82F6", // Blue
  "#8B5CF6", // Purple
  "#EC4899", // Pink
];

export const INCOME_COLORS = [
  "#3B82F6",
  "#2563EB",
  "#1D4ED8",
  "#6366F1",
  "#4F46E5",
  "#4338CA",
  "#93C5FD",
];

// =============================================
// DEMOGRAPHICS COLORS
// =============================================

export const COLOR_SINGLE = COLOR_PRIMARY;
export const COLOR_MARRIED = COLOR_TERTIARY;
export const COLOR_DIVORCED = COLOR_SECONDARY;
export const COLOR_WIDOWED = COLOR_ACCENT;
export const COLOR_SEPARATED = "#93C5FD";

export const COLOR_MALE = COLOR_PRIMARY;
export const COLOR_FEMALE = COLOR_PINK;

// =============================================
// PERFORMANCE COLORS
// =============================================

export const BLUE_MEDIUM = COLOR_PRIMARY;
export const DANGER_RED = COLOR_DANGER;
export const SUCCESS_GREEN = COLOR_SUCCESS;
export const WARNING_YELLOW = COLOR_WARNING;
export const EDUCATION_GREEN = COLOR_SUCCESS;
export const MEDICALS_BLUE = COLOR_PRIMARY;
export const BURIAL_YELLOW = "#FDE68A";

// =============================================
// COLOR HELPER FUNCTIONS
// =============================================

/**
 * Get color for gender (Male/Female)
 */
export function getGenderColor(gender) {
  if (!gender) return COLOR_DEFAULT;
  const normalized = gender.toString().trim().toLowerCase();
  if (normalized === "male") return COLOR_MALE;
  if (normalized === "female") return COLOR_FEMALE;
  return COLOR_DEFAULT;
}

/**
 * Get color for civil status
 */
export function getCivilStatusColor(status) {
  const norm = (status || "").toLowerCase();
  if (norm.includes("married")) return COLOR_MARRIED;
  if (norm.includes("single")) return COLOR_SINGLE;
  if (norm.includes("divorced")) return COLOR_DIVORCED;
  if (norm.includes("widowed")) return COLOR_WIDOWED;
  if (norm.includes("separated") || norm.includes("divprced")) return COLOR_SEPARATED;
  return COLOR_DEFAULT;
}

/**
 * Get color based on productivity count
 */
export function getProductivityColor(count) {
  if (count > 50) return BLUE_MEDIUM;
  if (count > 25) return WARNING_YELLOW;
  return DANGER_RED;
}

/**
 * Get color from chart colors array by index (with wrapping)
 */
export function getChartColor(index) {
  return CHART_COLORS[index % CHART_COLORS.length];
}

/**
 * Get color from COLORS array by index (with wrapping)
 */
export function getColorByIndex(index) {
  return COLORS[index % COLORS.length];
}

/**
 * Get color from income colors array by index (with wrapping)
 */
export function getIncomeColor(index) {
  return INCOME_COLORS[index % INCOME_COLORS.length];
}
