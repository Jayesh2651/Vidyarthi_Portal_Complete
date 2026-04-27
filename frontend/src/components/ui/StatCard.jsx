export function StatCard({ label, value, hint, icon: Icon }) {
  return (
    <article className="stat-card">
      <div className="stat-card__icon">{Icon ? <Icon size={20} /> : null}</div>
      <div>
        <span className="stat-card__label">{label}</span>
        <strong className="stat-card__value">{value}</strong>
        {hint ? <p className="stat-card__hint">{hint}</p> : null}
      </div>
    </article>
  )
}
