// Applies the stored theme before first paint, so the page never flashes the wrong one.
// Keep in sync with src/shared/theme (same "theme" key and values).
(function () {
  var theme = "system";
  try {
    theme = localStorage.getItem("theme") || "system";
  } catch (e) {
    // Storage unavailable: fall back to the system preference.
  }

  var dark = theme === "dark" || (theme !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  var resolved = dark ? "dark" : "light";

  document.documentElement.classList.add(resolved);
  document.documentElement.style.colorScheme = resolved;
})();
