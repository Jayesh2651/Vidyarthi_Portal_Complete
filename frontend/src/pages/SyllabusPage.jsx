import { EmptyState } from '../components/ui/EmptyState'
import { LoadingState } from '../components/ui/LoadingState'
import { ResourceCard } from '../components/ui/ResourceCard'
import { SectionIntro } from '../components/ui/SectionIntro'
import { useAsyncData } from '../hooks/useAsyncData'
import { usePageTitle } from '../hooks/usePageTitle'
import { portalService } from '../services/portalService'
import { formatDateTime, joinMeta } from '../utils/formatters'

export function SyllabusPage() {
  usePageTitle('Syllabus')
  const { data, loading, error } = useAsyncData(() => portalService.getSyllabus(), [])

  return (
    <div className="page-container page-stack">
      <section className="panel">
        <SectionIntro
          badge="Syllabus"
          centered
          title="Uploaded syllabus PDFs"
          description="Open the latest syllabus files shared by faculty."
        />

        {loading ? <LoadingState label="Loading syllabus files" /> : null}
        {error ? (
          <EmptyState
            description="The syllabus collection could not be loaded right now."
            title="Syllabus unavailable"
          />
        ) : null}

        {!loading && !error ? (
          data?.items?.length ? (
            <div className="cards-grid cards-grid--three">
              {data.items.map((item) => (
                <ResourceCard
                  actions={item.file_url ? [{ href: item.file_url, label: 'Download PDF' }] : []}
                  eyebrow={item.class_label}
                  key={item.id}
                  meta={joinMeta([item.year_label, formatDateTime(item.uploaded_at)])}
                  subtitle={item.subject}
                  title={item.title}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              description="No syllabus PDFs have been uploaded yet."
              title="Nothing here yet"
            />
          )
        ) : null}
      </section>
    </div>
  )
}
