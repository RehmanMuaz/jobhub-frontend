function MetricCard({ label, value, hint, trend, accent = "primary" }) {
  const trendValue = typeof trend === "number" ? `${trend}%` : trend;
  const isNegative = trendValue && trendValue.startsWith("-");
  const isPositive = trendValue && trendValue.startsWith("+");

  const className = ["metric-card", `metric-${accent}`]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className}>
      <p className="eyebrow">{label}</p>
      <div className="metric-main">
        <span className="metric-value">{value}</span>
        {trendValue && (
          <span
            className={`metric-trend${
              isNegative ? " trend-down" : isPositive ? " trend-up" : ""
            }`}
          >
            {trendValue}
          </span>
        )}
      </div>
      {hint && <p className="metric-hint">{hint}</p>}
    </div>
  );
}

export default MetricCard;
