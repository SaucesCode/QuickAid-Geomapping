/**
 * Canonical assistance type colors and helpers for charts, badges, and maps.
 * Use ASSISTANCE_TYPES for <option> lists to stay consistent.
 */

// Hex colors for Recharts and other chart libraries
export const ASSISTANCE_COLORS = {
  Medical: "#3B82F6",
  Educational: "#10B981",
  Burial: "#F59E0B",
};

export const ASSISTANCE_TYPES = ["Medical", "Educational", "Burial"];

const DEFAULT_HEX = "#94A3B8";

function normalizeType(type) {
  if (!type || typeof type !== "string") return "";
  return type.replace(/\s*Assistance\s*/gi, "").trim().toLowerCase();
}

/**
 * Returns hex for Medical/Educational/Burial; null for unknown (caller can use a fallback).
 */
export function getAssistanceColor(type) {
  const key = normalizeType(type);
  if (key.includes("medical")) return ASSISTANCE_COLORS.Medical;
  if (key.includes("educational")) return ASSISTANCE_COLORS.Educational;
  if (key.includes("burial")) return ASSISTANCE_COLORS.Burial;
  return null;
}

/**
 * Returns hex for charts; uses DEFAULT_HEX for unknown types.
 */
export function getAssistanceColorOrDefault(type) {
  return getAssistanceColor(type) ?? DEFAULT_HEX;
}

/**
 * For Dashboard Badge variant: "info" | "success" | "warning" | "default".
 */
export function getAssistanceTypeVariant(type) {
  const key = normalizeType(type);
  if (key.includes("medical")) return "info";
  if (key.includes("educational")) return "success";
  if (key.includes("burial")) return "warning";
  return "default";
}

// For Map/Leaflet: CSS color names or hex that work in SVG/Leaflet
export const ASSISTANCE_COLORS_FOR_MAP = {
  Medical: "blue",
  Educational: "green",
  Burial: "#fef08a",
};

/**
 * Returns Leaflet-friendly color for a given assistance type.
 */
export function getAssistanceMapColor(type) {
  const key = normalizeType(type);
  if (key.includes("medical")) return ASSISTANCE_COLORS_FOR_MAP.Medical;
  if (key.includes("educational")) return ASSISTANCE_COLORS_FOR_MAP.Educational;
  if (key.includes("burial")) return ASSISTANCE_COLORS_FOR_MAP.Burial;
  return "#f87171";
}
