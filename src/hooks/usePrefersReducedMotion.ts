import { useMediaQuery } from "./useMediaQuery";

/**
 * Tracks the user's OS "reduce motion" setting. Used to pause orbital animation
 * for users who are sensitive to motion.
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
