import { startTransition, useState } from 'react'

import { FilterBar } from '../components/ui/FilterBar'
import { EmptyState } from '../components/ui/EmptyState'
import { LoadingState } from '../components/ui/LoadingState'
import { ResourceCard } from '../components/ui/ResourceCard'
import { SectionIntro } from '../components/ui/SectionIntro'
import { assignmentSemesters, syllabusClasses } from '../data/portalContent'
import { useAsyncData } from '../hooks/useAsyncData'
import { usePageTitle } from '../hooks/usePageTitle'
import { portalService } from '../services/portalService'
import { formatDateTime, joinMeta } from '../utils/formatters'

const initialFilters = {
  class_name: '',
  year: '',
  semester: '',
  subject: '',
}

export function SyllabusPage() {
  usePageTitle('Syllabus')

  const [formFilters, setFormFilters] = useState(initialFilters)
  const [appliedFilters, setAppliedFilters] = useState(initialFilters)

  const { data, loading, error } = useAsyncData(
    () => portalService.getSyllabus(appliedFilters),
    [appliedFilters.class_name, appliedFilters.year, appliedFilters.semester, appliedFilters.subject],
  )

  function handleChange(event) {
    const { name, value } = event.target
    setFormFilters((current) => ({ ...current, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    startTransition(() => {
      setAppliedFilters(formFilters)
    })
  }

  function handleReset() {
    setFormFilters(initialFilters)
    startTransition(() => {
      setAppliedFilters(initialFilters)
    })
  }

  return (
    <div className="page-container page-stack">
      <section className="panel">
        <SectionIntro
          badge="Syllabus"
          centered
          title="Uploaded syllabus PDFs"
          description="Open the latest syllabus files shared by faculty."
        />

        <FilterBar
          fields={[
            {
              name: 'class_name',
              label: 'Class',
              options: syllabusClasses,
              placeholder: 'All classes',
              type: 'select',
            },
            {
              name: 'year',
              label: 'Year',
              options: (data?.options?.years ?? []).map((y) => ({ value: y, label: y })),
              placeholder: 'All years',
              type: 'select',
            },
            {
              name: 'semester',
              label: 'Semester',
              options: assignmentSemesters,
              placeholder: 'All semesters',
              type: 'select',
            },
            {
              name: 'subject',
              label: 'Subject',
              placeholder: 'Search subjects...',
              type: 'text',
            },
          ]}
          onChange={handleChange}
          onReset={handleReset}
          onSubmit={handleSubmit}
          submitLabel="Filter Syllabus"
          values={formFilters}
        />
      </section>

      {loading ? <LoadingState label="Loading syllabus files" /> : null}
      {error ? (
        <EmptyState
          description="The syllabus collection could not be loaded right now."
          title="Syllabus unavailable"
        />
      ) : null}

      {!loading && !error ? (
        <section className="panel">
          {data?.items?.length ? (
            <div className="cards-grid cards-grid--three">
              {data.items.map((item) => (
                <ResourceCard
                  actions={item.file_url ? [{ href: item.file_url, label: 'Download PDF' }] : []}
                  eyebrow={item.class_label}
                  key={item.id}
                  meta={joinMeta([item.year_label, item.semester_label, formatDateTime(item.uploaded_at)])}
                  subtitle={item.subject}
                  title={item.title}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              description="No syllabus PDFs matched the selected filters."
              title="Nothing found"
            />
          )}
        </section>
      ) : null}
    </div>
  )
}
