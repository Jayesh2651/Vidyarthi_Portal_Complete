import { useState } from 'react'

import { FileInput } from '../components/forms/FileInput'
import { SectionIntro } from '../components/ui/SectionIntro'
import { StatusMessage } from '../components/ui/StatusMessage'
import { assignmentSemesters, assignmentYears, syllabusClasses } from '../data/portalContent'
import { usePageTitle } from '../hooks/usePageTitle'
import { portalService } from '../services/portalService'

const initialForm = {
  title: '',
  class_name: '',
  subject: '',
  year: '',
  semester: '',
  file: null,
}

export function UploadSyllabusPage() {
  usePageTitle('Upload Syllabus')

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

    const formData = new FormData()
    formData.append('title', form.title)
    formData.append('class_name', form.class_name)
    formData.append('subject', form.subject)
    formData.append('year', form.year)
    formData.append('semester', form.semester)
    if (form.file) formData.append('file', form.file)

    setSubmitting(true)
    try {
      const response = await portalService.createSyllabus(formData)
      setStatus({ tone: 'success', message: response.data.message })
      setForm(initialForm)
    } catch (error) {
      setStatus({
        tone: 'error',
        message: error.response?.data?.message || 'Syllabus upload failed.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page-container page-stack page-stack--narrow">
      <section className="panel panel--admin">
        <SectionIntro
          badge="Upload Syllabus"
          title="Add new syllabus PDFs"
          description="Class, subject, year, and file upload are now handled through a React form with a dedicated API request."
        />

        <StatusMessage tone={status.tone}>{status.message}</StatusMessage>

        <form className="form-card" onSubmit={handleSubmit}>
          <div className="field-grid field-grid--two">
            <label className="form-field" htmlFor="syllabus-title">
              <span>Title</span>
              <input
                id="syllabus-title"
                name="title"
                onChange={handleChange}
                placeholder="FY BSc Physics Syllabus"
                required
                type="text"
                value={form.title}
              />
            </label>

            <label className="form-field" htmlFor="syllabus-class">
              <span>Class</span>
              <select id="syllabus-class" name="class_name" onChange={handleChange} required value={form.class_name}>
                <option value="">Select Class</option>
                {syllabusClasses.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field" htmlFor="syllabus-subject">
              <span>Subject</span>
              <input
                id="syllabus-subject"
                name="subject"
                onChange={handleChange}
                placeholder="Enter subject name"
                required
                type="text"
                value={form.subject}
              />
            </label>

            <label className="form-field" htmlFor="syllabus-year">
              <span>Academic Year</span>
              <select id="syllabus-year" name="year" onChange={handleChange} required value={form.year}>
                <option value="">Select Year</option>
                {assignmentYears.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field" htmlFor="syllabus-semester">
              <span>Semester</span>
              <select id="syllabus-semester" name="semester" onChange={handleChange} required value={form.semester}>
                <option value="">Select Semester</option>
                {assignmentSemesters.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <FileInput file={form.file} id="syllabus-file" label="Syllabus PDF" name="file" onChange={handleChange} required />

          <button className="button" disabled={submitting} type="submit">
            {submitting ? 'Uploading...' : 'Upload Syllabus'}
          </button>
        </form>
      </section>
    </div>
  )
}
