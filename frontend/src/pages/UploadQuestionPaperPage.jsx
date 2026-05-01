import { useState } from 'react'

import { FileInput } from '../components/forms/FileInput'
import { SectionIntro } from '../components/ui/SectionIntro'
import { StatusMessage } from '../components/ui/StatusMessage'
import { assignmentSemesters, questionPaperClasses, questionPaperExams } from '../data/portalContent'
import { usePageTitle } from '../hooks/usePageTitle'
import { portalService } from '../services/portalService'

const initialForm = {
  class_name: '',
  exam: '',
  subject: '',
  semester: '',
  upload_date: '',
  pdf_file: null,
}

export function UploadQuestionPaperPage() {
  usePageTitle('Upload Question Paper')

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
    formData.append('class_name', form.class_name)
    formData.append('exam', form.exam)
    formData.append('subject', form.subject)
    formData.append('semester', form.semester)
    formData.append('upload_date', form.upload_date)
    if (form.pdf_file) formData.append('pdf_file', form.pdf_file)

    setSubmitting(true)
    try {
      const response = await portalService.createQuestionPaper(formData)
      setStatus({ tone: 'success', message: response.data.message })
      setForm(initialForm)
    } catch (error) {
      setStatus({
        tone: 'error',
        message: error.response?.data?.message || 'Question paper upload failed.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page-container page-stack page-stack--narrow">
      <section className="panel panel--admin">
        <SectionIntro
          badge="Upload Question Papers"
          title="Publish university exam PDFs"
          description="Class, session, subject, and upload date are now posted through the API instead of a server-rendered form."
        />

        <StatusMessage tone={status.tone}>{status.message}</StatusMessage>

        <form className="form-card" onSubmit={handleSubmit}>
          <div className="field-grid field-grid--two">
            <label className="form-field" htmlFor="paper-class">
              <span>Class</span>
              <select id="paper-class" name="class_name" onChange={handleChange} required value={form.class_name}>
                <option value="">Select Class</option>
                {questionPaperClasses.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field" htmlFor="paper-exam">
              <span>Exam Session</span>
              <select id="paper-exam" name="exam" onChange={handleChange} required value={form.exam}>
                <option value="">Select Exam</option>
                {questionPaperExams.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field" htmlFor="paper-subject">
              <span>Subject</span>
              <input
                id="paper-subject"
                name="subject"
                onChange={handleChange}
                placeholder="Enter subject name"
                required
                type="text"
                value={form.subject}
              />
            </label>

            <label className="form-field" htmlFor="paper-semester">
              <span>Semester</span>
              <select id="paper-semester" name="semester" onChange={handleChange} required value={form.semester}>
                <option value="">Select Semester</option>
                {assignmentSemesters.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field" htmlFor="paper-date">
              <span>Upload Date</span>
              <input
                id="paper-date"
                name="upload_date"
                onChange={handleChange}
                required
                type="date"
                value={form.upload_date}
              />
            </label>
          </div>

          <FileInput file={form.pdf_file} id="paper-file" label="Question Paper PDF" name="pdf_file" onChange={handleChange} required />

          <button className="button" disabled={submitting} type="submit">
            {submitting ? 'Uploading...' : 'Upload Question Paper'}
          </button>
        </form>
      </section>
    </div>
  )
}
