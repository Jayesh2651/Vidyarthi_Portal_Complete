import { startTransition, useState } from 'react'

import { FilterBar } from '../components/ui/FilterBar'
import { EmptyState } from '../components/ui/EmptyState'
import { LoadingState } from '../components/ui/LoadingState'
import { ResourceCard } from '../components/ui/ResourceCard'
import { SectionIntro } from '../components/ui/SectionIntro'
import { assignmentClasses, assignmentSemesters } from '../data/portalContent'
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

export function AssignmentsPage() {
  usePageTitle('Assignments')

  const [formFilters, setFormFilters] = useState(initialFilters)
  const [appliedFilters, setAppliedFilters] = useState(initialFilters)

  const { data, loading, error } = useAsyncData(
    () => portalService.getAssignments(appliedFilters),
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

  const theoryItems = data?.items?.filter((item) => item.theory_pdf_url) ?? []
  const practicalItems = data?.items?.filter((item) => item.practical_pdf_url) ?? []
  const hasActiveFilters = Object.values(appliedFilters).some(Boolean)

  return (
    <div className="page-container page-stack">
      <section className="panel">
        <SectionIntro
          badge="Assignments"
          centered
          title="Theory and practical assignments"
          description="Filter by class, academic year, semester, and subject without leaving the page."
        />

        <FilterBar
          fields={[
            {
              name: 'class_name',
              label: 'Class',
              options: assignmentClasses,
              placeholder: 'All classes',
              type: 'select',
            },
            {
              name: 'year',
              label: 'Academic Year',
              options: (data?.options?.years ?? []).map((year) => ({ value: year, label: year })),
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
          submitLabel="Filter Assignments"
          values={formFilters}
        />
      </section>

      {loading ? <LoadingState label="Loading assignments" /> : null}
      {error ? (
        <EmptyState
          description="Assignments could not be loaded right now."
          title="Assignment feed unavailable"
        />
      ) : null}

      {!loading && !error && data?.latest_assignment ? (
        <section className="panel panel--highlight">
          <SectionIntro
            badge={hasActiveFilters ? 'Filtered Result' : `Latest Year ${data.latest_year || ''}`}
            title="Most recent assignment"
            description="The latest matching upload is surfaced first so students can jump straight to the current file."
          />
          <div className="cards-grid cards-grid--two">
            <ResourceCard
              actions={
                data.latest_assignment.theory_pdf_url
                  ? [{ href: data.latest_assignment.theory_pdf_url, label: 'Open Theory PDF' }]
                  : []
              }
              eyebrow={data.latest_assignment.class_label}
              meta={joinMeta([
                data.latest_assignment.year_label,
                data.latest_assignment.semester_label,
                formatDateTime(data.latest_assignment.uploaded_at),
              ])}
              subtitle={data.latest_assignment.subject}
              title="Theory Assignment"
            />
            <ResourceCard
              actions={
                data.latest_assignment.practical_pdf_url
                  ? [{ href: data.latest_assignment.practical_pdf_url, label: 'Open Practical PDF' }]
                  : []
              }
              eyebrow={data.latest_assignment.class_label}
              meta={joinMeta([
                data.latest_assignment.year_label,
                data.latest_assignment.semester_label,
                formatDateTime(data.latest_assignment.uploaded_at),
              ])}
              subtitle={data.latest_assignment.subject}
              title="Practical Assignment"
            />
          </div>
        </section>
      ) : null}

      {!loading && !error ? (
        <>
          <section className="panel">
            <SectionIntro
              badge="Theory"
              title="Theory assignments"
              description="Download theory work by class, subject, and semester."
            />
            {theoryItems.length ? (
              <div className="cards-grid cards-grid--three">
                {theoryItems.map((item) => (
                  <ResourceCard
                    actions={[{ href: item.theory_pdf_url, label: 'Download Theory PDF' }]}
                    eyebrow={item.class_label}
                    key={`theory-${item.id}`}
                    meta={joinMeta([item.year_label, item.semester_label, formatDateTime(item.uploaded_at)])}
                    subtitle={item.subject}
                    title={`${item.class_label} Assignment`}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                description="No theory assignments matched the selected filters."
                title="No theory assignments"
              />
            )}
          </section>

          <section className="panel">
            <SectionIntro
              badge="Practical"
              title="Practical assignments"
              description="Download practical work from the same filtered list."
            />
            {practicalItems.length ? (
              <div className="cards-grid cards-grid--three">
                {practicalItems.map((item) => (
                  <ResourceCard
                    actions={[{ href: item.practical_pdf_url, label: 'Download Practical PDF' }]}
                    eyebrow={item.class_label}
                    key={`practical-${item.id}`}
                    meta={joinMeta([item.year_label, item.semester_label, formatDateTime(item.uploaded_at)])}
                    subtitle={item.subject}
                    title={`${item.class_label} Assignment`}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                description="No practical assignments matched the selected filters."
                title="No practical assignments"
              />
            )}
          </section>
        </>
      ) : null}
    </div>
  )
}
