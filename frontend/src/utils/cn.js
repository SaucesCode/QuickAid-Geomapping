import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * cn() — Combines Tailwind class names intelligently.
 * Example:
 * cn("p-4", condition && "bg-blue-500", "rounded")
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
