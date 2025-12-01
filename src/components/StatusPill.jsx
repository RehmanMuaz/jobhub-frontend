const STATUS_STYLES = {
  new: { label: "New", tone: "neutral" },
  applied: { label: "Applied", tone: "info" },
  rejected: { label: "Rejected", tone: "danger" },
  interview: { label: "Interview", tone: "accent" },
  offer: { label: "Offer", tone: "success" },
};

function normalizeStatus(value) {
  if (!value) return "new";
  return String(value).toLowerCase();
}

function StatusPill({
  status,
  label,
  subtle = false,
  size = "md",
  onClick,
  className = "",
}) {
  const key = normalizeStatus(status);
  const config = STATUS_STYLES[key] || STATUS_STYLES.new;
  const tone = config.tone || "neutral";
  const pillLabel = label || config.label;
  const composedClassName = [
    "status-pill",
    `tone-${tone}`,
    subtle ? "status-pill-subtle" : "",
    size ? `status-${size}` : "",
    onClick ? "status-clickable" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={composedClassName}
      onClick={onClick || undefined}
    >
      <span className="status-dot" aria-hidden />
      <span>{pillLabel}</span>
    </button>
  );
}

export { STATUS_STYLES };
export default StatusPill;
