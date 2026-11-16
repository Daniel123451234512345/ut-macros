export type ThemePref = "auto" | "light" | "dark";

/**
 * Runs in <head> before first paint so a saved Light/Dark choice never flashes.
 * "auto" leaves <html> without data-theme, and the CSS follows the device setting.
 * Reads the same key that useStored("theme") writes (JSON-encoded).
 */
export const THEME_SCRIPT = `(function(){try{var t=JSON.parse(localStorage.getItem("lm:v1:theme"));if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export function applyTheme(t: ThemePref) {
  const el = document.documentElement;
  if (t === "auto") el.removeAttribute("data-theme");
  else el.setAttribute("data-theme", t);
}
