function Panel({ title, subtitle, action, children, className = "" }) {
  const panelClass = ["panel", className].filter(Boolean).join(" ");

  return (
    <section className={panelClass}>
      {(title || subtitle || action) && (
        <div className="panel-header">
          <div className="panel-titles">
            {title && <p className="eyebrow">{title}</p>}
            {subtitle && <h3 className="panel-subtitle">{subtitle}</h3>}
          </div>
          {action && <div className="panel-action">{action}</div>}
        </div>
      )}
      <div className="panel-body">{children}</div>
    </section>
  );
}

export default Panel;
