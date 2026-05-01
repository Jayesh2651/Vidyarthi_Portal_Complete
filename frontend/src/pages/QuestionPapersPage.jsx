import { startTransition, useState } from 'react'

import { FilterBar } from '../components/ui/FilterBar'
import { EmptyState } from '../components/ui/EmptyState'
import { LoadingState } from '../components/ui/LoadingState'
import { ResourceCard } from '../components/ui/ResourceCard'
import { SectionIntro } from '../components/ui/SectionIntro'
import { assignmentSemesters, questionPaperClasses, questionPaperExams } from '../data/portalContent'
import { useAsyncData } from '../hooks/useAsyncData'
import { usePageTitle } from '../hooks/usePageTitle'
import { portalService } from '../services/portalService'
import { formatDate, joinMeta } from '../utils/formatters'

const initialFilters = {
  year: '',
  class_name: '',
  exam: '',
  semester: '',
}

export function QuestionPapersPage() {
  usePageTitle('Question Papers')

  const [formFilters, setFormFilters] = useState(initialFilters)
  const [appliedFilters, setAppliedFilters] = useState(initialFilters)

  const { data, loading, error } = useAsyncData(
    () => portalService.getQuestionPapers(appliedFilters),
    [appliedFilters.year, appliedFilters.class_name, appliedFilters.exam, appliedFilters.semester],
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
          badge="Question Papers"
          centered
          title="University exam papers"
          description="Filter past papers by year, class, and exam session without reloading the page."
        />

        <FilterBar
          fields={[
            {
              name: 'year',
              label: 'Year',
              options: (data?.years ?? []).map((year) => ({ value: year, label: year })),
              placeholder: 'All years',
              type: 'select',
            },
            {
              name: 'class_name',
              label: 'Class',
              options: questionPaperClasses,
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
              name: 'exam',
              label: 'Exam Session',
              options: questionPaperExams,
              placeholder: 'All sessions',
              type: 'select',
            },
          ]}
          onChange={handleChange}
          onReset={handleReset}
          onSubmit={handleSubmit}
          submitLabel="Search Papers"
          values={formFilters}
        />
      </section>

      {loading ? <LoadingState label="Loading question papers" /> : null}
      {error ? (
        <EmptyState
          description="Question papers could not be loaded right now."
          title="Question papers unavailable"
        />
      ) : null}

      {!loading && !error ? (
        <section className="panel">
          <SectionIntro
            badge="Available Papers"
            title="Download question paper PDFs"
            description="Everything is now routed through React while the Django API handles the file data."
          />

          {data?.items?.length ? (
            <div className="cards-grid cards-grid--three">
              {data.items.map((paper) => (
                <ResourceCard
                  actions={paper.pdf_file_url ? [{ href: paper.pdf_file_url, label: 'Download PDF' }] : []}
                  eyebrow={paper.class_label}
                  key={paper.id}
                  meta={joinMeta([paper.semester_label, formatDate(paper.upload_date)])}
                  subtitle={paper.exam}
                  title={paper.subject}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              description="No question papers matched the selected filters."
              title="No papers found"
            />
          )}
        </section>
      ) : null}
    </div>
  )
}
