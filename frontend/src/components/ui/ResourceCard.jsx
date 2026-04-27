export function ResourceCard({ eyebrow, title, subtitle, description, meta, actions = [] }) {
  return (
    <article className="resource-card">
      {eyebrow ? <span className="resource-card__eyebrow">{eyebrow}</span> : null}
      <h3>{title}</h3>
      {subtitle ? <p className="resource-card__subtitle">{subtitle}</p> : null}
      {description ? <p className="resource-card__description">{description}</p> : null}
      {meta ? <p className="resource-card__meta">{meta}</p> : null}
      {actions.length ? (
        <div className="resource-card__actions">
          {actions.map((action) => (
            <a
              className="button button--secondary"
              href={action.href}
              key={`${action.label}-${action.href}`}
              rel="noreferrer"
              target="_blank"
            >
              {action.label}
            </a>
          ))}
        </div>
      ) : null}
    </article>
  )
}
