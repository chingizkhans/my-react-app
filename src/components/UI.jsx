export function MetricCard({
  title,
  value,
  delta,
  tone = "ink",
  eyebrow,
  trend = "stable",
}) {
  return (
    <article className={`metric-card ${tone}`}>
      <div className="metric-top">
        <p>{title}</p>
        {eyebrow ? <span className="metric-eyebrow">{eyebrow}</span> : null}
      </div>
      <h3>{value}</h3>
      <span className={`metric-delta trend-${trend}`}>{delta}</span>
    </article>
  );
}

export function StatusPill({ value }) {
  const normalized = String(value).toLowerCase();
  const tone =
    normalized === "published" ||
    normalized === "approved" ||
    normalized === "active" ||
    normalized === "sent to oprp"
      ? "good"
      : normalized === "review" ||
          normalized === "limited" ||
          normalized === "high" ||
          normalized === "pending"
        ? "warn"
        : normalized === "rejected"
          ? "danger"
          : "muted";

  return <span className={`status-pill ${tone}`}>{value}</span>;
}

export function SectionHead({ title, subtitle, action }) {
  return (
    <div className="section-head">
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
