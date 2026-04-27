import { Link } from 'react-router-dom'

import { EmptyState } from '../components/ui/EmptyState'
import { LoadingState } from '../components/ui/LoadingState'
import { SectionIntro } from '../components/ui/SectionIntro'
import { StatCard } from '../components/ui/StatCard'
import { adminActions, dashboardHighlights } from '../data/portalContent'
import { useAsyncData } from '../hooks/useAsyncData'
import { usePageTitle } from '../hooks/usePageTitle'
import { portalService } from '../services/portalService'
import { formatDateTime, joinMeta } from '../utils/formatters'

export function DashboardPage() {
  usePageTitle('Dashboard')
  const { data, loading, error } = useAsyncData(() => portalService.getDashboardSummary(), [])

  return (
    <div className="page-container page-stack">
      <section className="panel panel--admin">
        <SectionIntro
          badge="Admin Dashboard"
          title="Manage portal resources"
          description="Upload files, publish updates, and jump into the question paper editor without leaving the SPA."
        />

        {loading ? <LoadingState label="Loading dashboard summary" /> : null}

        {!loading && !error ? (
          <div className="stats-grid">
            {adminActions.slice(0, 5).map((action) => {
              const Icon = action.icon
              const value = action.countKey ? data?.counts?.[action.countKey] ?? 0 : '--'
              return (
                <StatCard
                  hint={action.description}
                  icon={Icon}
                  key={action.title}
                  label={action.title}
                  value={value}
                />
              )
            })}
            {dashboardHighlights.map((highlight) => {
              const Icon = highlight.icon
              return (
                <StatCard
                  hint={highlight.description}
                  icon={Icon}
                  key={highlight.title}
                  label={highlight.title}
                  value={data?.counts?.important_links ?? 0}
                />
              )
            })}
          </div>
        ) : null}
      </section>

      <section className="dashboard-grid">
        {adminActions.map((action) => {
          const Icon = action.icon
          return (
            <Link className="dashboard-card" key={action.path} to={action.path}>
              <div className="dashboard-card__icon">
                <Icon size={20} />
              </div>
              <div>
                <h3>{action.title}</h3>
                <p>{action.description}</p>
              </div>
            </Link>
          )
        })}
      </section>

      <section className="panel">
        <SectionIntro
          badge="Recent Activity"
          title="Latest uploaded resources"
          description="A quick pulse check across the most recent content in the portal."
        />

        {loading ? null : error ? (
          <EmptyState
            description="The recent activity feed could not be loaded right now."
            title="Activity unavailable"
          />
        ) : (
          <div className="cards-grid cards-grid--three">
            {[
              data?.latest?.syllabus && {
                title: data.latest.syllabus.title,
                subtitle: data.latest.syllabus.subject,
                meta: joinMeta([data.latest.syllabus.class_label, formatDateTime(data.latest.syllabus.uploaded_at)]),
              },
              data?.latest?.assignment && {
                title: data.latest.assignment.subject,
                subtitle: `${data.latest.assignment.class_label} | ${data.latest.assignment.semester_label}`,
                meta: formatDateTime(data.latest.assignment.uploaded_at),
              },
              data?.latest?.unit_test && {
                title: data.latest.unit_test.subject,
                subtitle: `${data.latest.unit_test.class_label} | ${data.latest.unit_test.semester_label}`,
                meta: formatDateTime(data.latest.unit_test.uploaded_at),
              },
              data?.latest?.question_paper && {
                title: data.latest.question_paper.subject,
                subtitle: data.latest.question_paper.exam,
                meta: formatDateTime(data.latest.question_paper.uploaded_at),
              },
              data?.latest?.news_event && {
                title: data.latest.news_event.news_title,
                subtitle: 'News & Events',
                meta: data.latest.news_event.news_date,
              },
            ]
              .filter(Boolean)
              .map((item) => (
                <article className="resource-card" key={`${item.title}-${item.meta}`}>
                  <h3>{item.title}</h3>
                  <p className="resource-card__subtitle">{item.subtitle}</p>
                  <p className="resource-card__meta">{item.meta}</p>
                </article>
              ))}
          </div>
        )}
      </section>
    </div>
  )
}
