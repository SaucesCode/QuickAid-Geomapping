import { useEffect } from "react";

const PREFIX = "QuickAid | ";
const DEFAULT_TITLE = "QuickAid | Home";

/**
 * Sets document.title on mount and resets to "QuickAid | Home" on unmount.
 * @param {string} pageName - The part after "QuickAid | " (e.g. "Applicants" → "QuickAid | Applicants")
 */
export function usePageTitle(pageName) {
  useEffect(() => {
    document.title = pageName ? `${PREFIX}${pageName}` : DEFAULT_TITLE;
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [pageName]);
}
