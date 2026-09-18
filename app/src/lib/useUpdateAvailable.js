import { useEffect, useRef, useState } from "react";

// GitHub Pages doesn't push a new deploy to a tab that's already open --
// urusetia's dashboard and every peserta's phone keep running whatever JS
// they loaded until the page is reloaded, however many deploys happen
// after. During a live event with fixes shipping every few minutes, that
// silently leaves some devices behind (a feature just deployed looks
// "missing" on a phone that's simply stale, not broken). Vite content-
// hashes every asset filename on each build, so index.html's own content
// changes on every deploy -- polling it is a reliable, dependency-free way
// to notice a new version exists without needing a server push mechanism.
export function useUpdateAvailable() {
  const [available, setAvailable] = useState(false);
  const initialHtml = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const url = `${import.meta.env.BASE_URL}index.html`;

    const check = async () => {
      try {
        const res = await fetch(`${url}?_=${Date.now()}`, { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const text = await res.text();
        if (cancelled) return;
        if (initialHtml.current === null) {
          initialHtml.current = text;
        } else if (text !== initialHtml.current) {
          setAvailable(true);
        }
      } catch {
        // offline/network hiccup -- just try again on the next poll
      }
    };

    check();
    const interval = setInterval(check, 60000);
    const onVisible = () => {
      if (!document.hidden) check();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return available;
}
