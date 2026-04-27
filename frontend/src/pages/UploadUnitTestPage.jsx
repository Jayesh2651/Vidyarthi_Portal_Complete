import { useState } from 'react'

import { FileInput } from '../components/forms/FileInput'
import { SectionIntro } from '../components/ui/SectionIntro'
import { StatusMessage } from '../components/ui/StatusMessage'
import { assignmentClasses, assignmentSemesters, assignmentYears } from '../data/portalContent'
import { usePageTitle } from '../hooks/usePageTitle'
import { portalService } from '../services/portalService'

const initialForm = {
  class_name: '',
  year: '',
  semester: '',
  subject: '',
  theory_pdf: null,
  practical_pdf: null,
}

export function UploadUnitTestPage() {
  usePageTitle('Upload Unit Test')

  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState({ tone: 'info', message: '' })

  function handleChange(event) {
    const { name, value, files } = event.target
    setForm((current) => ({
      ...current,
      [name]: files ? files[0] || null : value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus({ tone: 'info', message: '' })

    if (!form.theory_pdf && !form.practical_pdf) {
      setStatus({ tone: 'error', message: 'Upload at least one unit test PDF.' })
      return
    }

    const formData = new FormData()
    formData.append('class_name', form.class_name)
    formData.append('year', form.year)
    formData.append('semester', form.semester)
    formData.append('subject', form.subject)
    if (form.theory_pdf) formData.append('theory_pdf', form.theory_pdf)
    if (form.practical_pdf) formData.append('practical_pdf', form.practical_pdf)

    setSubmitting(true)
    try {
      const response = await portalService.createUnitTest(formData)
      setStatus({ tone: 'success', message: response.data.message })
      setForm(initialForm)
    } catch (error) {
      setStatus({
        tone: 'error',
        message: error.response?.data?.non_field_errors?.[0] || error.response?.data?.message || 'Unit test upload failed.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page-container page-stack page-stack--narrow">
      <section className="panel panel--admin">
        <SectionIntro
          badge="Upload Unit Tests"
          title="Share unit test PDFs"
          description="Theory and practical files can now be posted through a clean React form backed by the Django API."
        />

        <StatusMessage tone={status.tone}>{status.message}</StatusMessage>

        <form className="form-card" onSubmit={handleSubmit}>
          <div className="field-grid field-grid--two">
            <label className="form-field" htmlFor="unit-class">
              <span>Class</span>
              <select id="unit-class" name="class_name" onChange={handleChange} required value={form.class_name}>
                <option value="">Select Class</option>
                {assignmentClasses.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field" htmlFor="unit-year">
              <span>Academic Year</span>
              <select id="unit-year" name="year" onChange={handleChange} required value={form.year}>
                <option value="">Select Year</option>
                {assignmentYears.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field" htmlFor="unit-semester">
              <span>Semester</span>
              <select id="unit-semester" name="semester" onChange={handleChange} required value={form.semester}>
                <option value="">Select Semester</option>
                {assignmentSemesters.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field" htmlFor="unit-subject">
              <span>Subject</span>
              <input
                id="unit-subject"
                name="subject"
                onChange={handleChange}
                placeholder="Enter subject name"
                required
                type="text"
                value={form.subject}
              />
            </label>
          </div>

          <div className="field-grid field-grid--two">
            <FileInput file={form.theory_pdf} id="unit-theory" label="Theory PDF" name="theory_pdf" onChange={handleChange} />
            <FileInput file={form.practical_pdf} id="unit-practical" label="Practical PDF" name="practical_pdf" onChange={handleChange} />
          </div>

          <button className="button" disabled={submitting} type="submit">
            {submitting ? 'Uploading...' : 'Upload Unit Test'}
          </button>
        </form>
      </section>
    </div>
  )
}
