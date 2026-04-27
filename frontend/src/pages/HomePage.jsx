import { ArrowRight, BookOpenCheck, Link2, Newspaper } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Footer } from '../components/layout/Footer'
import { EmptyState } from '../components/ui/EmptyState'
import { LoadingState } from '../components/ui/LoadingState'
import { SectionIntro } from '../components/ui/SectionIntro'
import { homeInfoBlocks, portalHighlights, staffProfiles } from '../data/portalContent'
import { useAsyncData } from '../hooks/useAsyncData'
import { usePageTitle } from '../hooks/usePageTitle'
import { portalService } from '../services/portalService'
import { formatDate } from '../utils/formatters'

export function HomePage() {
  usePageTitle('Home')

  const { data, loading, error } = useAsyncData(() => portalService.getHome(), [])

  return (
    <div className="page-container page-stack">
      <section className="hero-panel">
        <div className="hero-panel__copy">
          <span className="section-intro__badge">Student & Staff Portal</span>
          <h1>Welcome to Vidyarthi Mitra Portal</h1>
          <p>
            Your academic companion for syllabus files, assignments, unit tests, question papers,
            and campus updates in one modern single-page experience.
          </p>
          <div className="button-row">
            <Link className="button" to="/home_assignments">
              Explore Assignments
            </Link>
            <Link className="button button--secondary" to="/syllabus">
              View Syllabus
            </Link>
          </div>
        </div>
        <div className="hero-panel__facts">
          <div className="hero-fact">
            <BookOpenCheck size={18} />
            <div>
              <strong>Organized resources</strong>
              <span>Everything students usually hunt for is easier to reach.</span>
            </div>
          </div>
          <div className="hero-fact">
            <Newspaper size={18} />
            <div>
              <strong>Fresh updates</strong>
              <span>News, events, and important links stay on the front page.</span>
            </div>
          </div>
          <div className="hero-fact">
            <Link2 size={18} />
            <div>
              <strong>Teacher-ready publishing</strong>
              <span>Uploads and announcements move through a dedicated admin area.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="cards-grid cards-grid--highlights">
        {portalHighlights.map((item) => {
          const Icon = item.icon
          return (
            <Link className="highlight-card" key={item.path} to={item.path}>
              <div className="highlight-card__icon">
                <Icon size={20} />
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <span className="highlight-card__cta">
                Open <ArrowRight size={16} />
              </span>
            </Link>
          )
        })}
      </section>

      <section className="panel">
        <SectionIntro
          badge="About Us"
          title="The original portal, refreshed"
          description="Vidyarthi Mitra still centers the same academic structure, but the experience is cleaner, faster, and easier to navigate across phone and desktop."
        />
        <div className="cards-grid cards-grid--three">
          {homeInfoBlocks.map((item) => (
            <article className="info-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="split-grid">
        <div className="panel">
          <SectionIntro
            badge="Dedicated Staff"
            title="People behind the portal"
            description="A familiar part of the original site, carried forward with a calmer and more polished layout."
          />
          <div className="cards-grid cards-grid--three">
            {staffProfiles.map((profile) => (
              <article className="staff-card" key={profile.name}>
                <h3>{profile.name}</h3>
                <p>{profile.role}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="panel">
          <SectionIntro
            badge="News & Events"
            title="Latest updates"
            description="Recent announcements and important reference links for students."
          />

          {loading ? <LoadingState label="Loading latest updates" /> : null}
          {error ? (
            <EmptyState
              description="We couldn't load the latest updates right now."
              title="Updates unavailable"
            />
          ) : null}

          {!loading && !error ? (
            <div className="stack-lg">
              <div className="stack-md">
                {data?.news_events?.length ? (
                  data.news_events.map((news) => (
                    <article className="news-card" key={news.id}>
                      <div className="news-card__header">
                        <h3>{news.news_title}</h3>
                        <span>{formatDate(news.news_date)}</span>
                      </div>
                      <p>{news.news_description}</p>
                      {news.attachment_url ? (
                        <a
                          className="button button--secondary"
                          href={news.attachment_url}
                          rel="noreferrer"
                          target="_blank"
                        >
                          Open attachment
                        </a>
                      ) : null}
                    </article>
                  ))
                ) : (
                  <EmptyState
                    description="No campus announcements have been published yet."
                    title="No news yet"
                  />
                )}
              </div>

              <div className="link-panel">
                <h3>Important Links</h3>
                {data?.important_links?.length ? (
                  <div className="link-list">
                    {data.important_links.map((link) => (
                      <a href={link.link_url} key={link.id} rel="noreferrer" target="_blank">
                        <strong>{link.link_title}</strong>
                        {link.link_description ? <span>{link.link_description}</span> : null}
                      </a>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    description="Important links will appear here once they are published."
                    title="No links yet"
                  />
                )}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <Footer />
    </div>
  )
}
