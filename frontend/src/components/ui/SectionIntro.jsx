export function SectionIntro({ badge, title, description, centered = false }) {
  return (
    <div className={`section-intro ${centered ? 'section-intro--centered' : ''}`}>
      {badge ? <span className="section-intro__badge">{badge}</span> : null}
      <h1>{title}</h1>
      {description ? <p>{description}</p> : null}
    </div>
  )
}
