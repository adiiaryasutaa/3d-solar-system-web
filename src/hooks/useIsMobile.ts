import { useMediaQuery } from "./useMediaQuery";

/** True when the viewport is narrower than `breakpoint` (default 768px). */
export function useIsMobile(breakpoint = 768): boolean {
  return useMediaQuery(`(max-width: ${breakpoint - 1}px)`);
}
