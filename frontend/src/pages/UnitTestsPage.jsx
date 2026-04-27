import { startTransition, useState } from 'react'

import { FilterBar } from '../components/ui/FilterBar'
import { EmptyState } from '../components/ui/EmptyState'
import { LoadingState } from '../components/ui/LoadingState'
import { ResourceCard } from '../components/ui/ResourceCard'
import { SectionIntro } from '../components/ui/SectionIntro'
import { assignmentSemesters, assignmentClasses } from '../data/portalContent'
import { useAsyncData } from '../hooks/useAsyncData'
import { usePageTitle } from '../hooks/usePageTitle'
import { portalService } from '../services/portalService'
import { formatDateTime, joinMeta } from '../utils/formatters'

const initialFilters = {
  year: '',
  class_name: '',
  semester: '',
  subject: '',
}

export function UnitTestsPage() {
  usePageTitle('Unit Tests')

  const [formFilters, setFormFilters] = useState(initialFilters)
  const [appliedFilters, setAppliedFilters] = useState(initialFilters)

  const { data, loading, error } = useAsyncData(
    () => portalService.getUnitTests(appliedFilters),
    [appliedFilters.year, appliedFilters.class_name, appliedFilters.semester, appliedFilters.subject],
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

  const hasActiveFilters = Object.values(appliedFilters).some(Boolean)

  return (
    <div className="page-container page-stack">
      <section className="panel">
        <SectionIntro
          badge="Unit Tests"
          centered
          title="Theory and practical unit test PDFs"
          description="The latest year appears by default, and you can tighten the view with quick client-side route-safe filtering."
        />

        <FilterBar
          fields={[
            {
              name: 'year',
              label: 'Academic Year',
              options: (data?.options?.years ?? []).map((year) => ({ value: year, label: year })),
              placeholder: 'Latest year',
              type: 'select',
            },
            {
              name: 'class_name',
              label: 'Class',
              options: assignmentClasses,
              placeholder: 'All classes',
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
              options: (data?.options?.subjects ?? []).map((subject) => ({
                value: subject,
                label: subject,
              })),
              placeholder: 'All subjects',
              type: 'select',
            },
          ]}
          onChange={handleChange}
          onReset={handleReset}
          onSubmit={handleSubmit}
          submitLabel="View Unit Tests"
          values={formFilters}
        />
      </section>

      {loading ? <LoadingState label="Loading unit tests" /> : null}
      {error ? (
        <EmptyState
          description="Unit test PDFs could not be loaded right now."
          title="Unit tests unavailable"
        />
      ) : null}

      {!loading && !error ? (
        <section className="panel">
          <SectionIntro
            badge={hasActiveFilters ? 'Filtered Unit Tests' : `Latest Year ${data?.latest_year || ''}`}
            title="Available uploads"
            description="Each card keeps both theory and practical files together for faster access."
          />

          {data?.items?.length ? (
            <div className="cards-grid cards-grid--three">
              {data.items.map((item) => (
                <ResourceCard
                  actions={[
                    ...(item.theory_pdf_url
                      ? [{ href: item.theory_pdf_url, label: 'Theory PDF' }]
                      : []),
                    ...(item.practical_pdf_url
                      ? [{ href: item.practical_pdf_url, label: 'Practical PDF' }]
                      : []),
                  ]}
                  eyebrow={item.class_label}
                  key={item.id}
                  meta={joinMeta([item.year_label, item.semester_label, formatDateTime(item.uploaded_at)])}
                  subtitle={item.subject}
                  title="Unit Test Upload"
                />
              ))}
            </div>
          ) : (
            <EmptyState
              description="No unit test PDFs matched the selected filters."
              title="No unit tests found"
            />
          )}
        </section>
      ) : null}
    </div>
  )
}
