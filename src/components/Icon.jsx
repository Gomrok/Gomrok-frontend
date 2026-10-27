const iconSources = import.meta.glob("../assets/icons/*.svg", {
  eager: true,
  import: "default",
  query: "?raw",
});

const iconMarkup = Object.fromEntries(
  Object.entries(iconSources).map(([path, source]) => [
    path.slice("../assets/icons/".length, -".svg".length),
    source
      .replace(
        /<svg\b/,
        '<svg class="icon" aria-hidden="true" focusable="false"',
      )
      .replace(/\s(?:width|height)="[^"]*"/g, ""),
  ]),
);

const iconAliases = { "circle-question-mark": "circle-help" };

export function Icon({ name, className = "" }) {
  const markup = iconMarkup[name] || iconMarkup[iconAliases[name]];
  if (!markup) return null;

  return (
    <span
      className={`icon-wrapper ${className}`.trim()}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}
