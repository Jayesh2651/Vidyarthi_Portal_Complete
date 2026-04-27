import { SectionIntro } from '../components/ui/SectionIntro'
import { practicals } from '../data/portalContent'
import { usePageTitle } from '../hooks/usePageTitle'

export function PracticalsPage() {
  usePageTitle('Practicals')

  return (
    <div className="page-container page-stack">
      <section className="panel">
        <SectionIntro
          badge="Practicals"
          centered
          title="Year-wise practical outline"
          description="A recognizable version of the original practicals page, styled for easier scanning."
        />
        <div className="cards-grid cards-grid--three">
          {practicals.map((group) => (
            <article className="resource-card" key={group.label}>
              <span className="resource-card__eyebrow">Practical Track</span>
              <h3>{group.label}</h3>
              <ul className="detail-list">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
