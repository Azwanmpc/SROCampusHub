// Chart.js draws to <canvas>, so it never picks up our CSS variables or
// [data-theme="dark"] automatically — every chart must read these colors
// explicitly when built, and rebuild whenever the theme toggles.
export function isDarkTheme() {
  if (typeof document === "undefined") return false;
  return document.documentElement.getAttribute("data-theme") === "dark";
}

export function getChartColors() {
  const dark = isDarkTheme();
  return {
    text: dark ? "#f3f2f2" : "#201e1d",
    grid: dark ? "rgba(243, 242, 242, 0.15)" : "rgba(32, 30, 29, 0.1)",
  };
}
