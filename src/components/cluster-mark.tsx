type ClusterMarkProps = {
  size?: number;
  variant?: "default" | "reversed" | "monochrome";
  className?: string;
};

export function ClusterMark({
  size = 100,
  variant = "default",
  className,
}: ClusterMarkProps) {
  const ink = variant === "reversed" ? "var(--paper)" : "var(--ink)";
  const accent =
    variant === "monochrome" ? ink : "var(--brick)";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      aria-label="Trove cluster mark"
    >
      <circle cx="38" cy="32" r="4.5" fill={ink} />
      <circle cx="58" cy="22" r="6.5" fill={accent} />
      <circle cx="78" cy="34" r="4.5" fill={ink} />
      <circle cx="44" cy="56" r="5" fill={ink} />
      <circle cx="68" cy="64" r="6" fill={ink} />
      <circle cx="56" cy="44" r="3.5" fill={ink} />
      <circle cx="80" cy="58" r="3" fill={ink} />
    </svg>
  );
}
