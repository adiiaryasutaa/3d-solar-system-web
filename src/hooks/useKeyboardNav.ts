import { useEffect } from "react";
import { PLANETS } from "@/data/planets";
import { useSolarSystem } from "@/store/useSolarSystem";

/**
 * Keyboard navigation: ←/→ cycle through planets (wrapping), Esc clears focus.
 * Mounted once at the page level. Any selection here counts as manual and stops
 * the auto-tour (via the store's `select`).
 */
export function useKeyboardNav(): void {
  useEffect(() => {
    const ids = PLANETS.map((p) => p.id);

    const onKey = (e: KeyboardEvent) => {
      const { selectedId, select, clear } = useSolarSystem.getState();

      if (e.key === "Escape") {
        clear();
        return;
      }
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;

      e.preventDefault();
      const dir = e.key === "ArrowRight" ? 1 : -1;
      const cur = selectedId ? ids.indexOf(selectedId) : -1;
      const next =
        cur === -1
          ? dir === 1
            ? 0
            : ids.length - 1
          : (cur + dir + ids.length) % ids.length;
      select(ids[next]);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
