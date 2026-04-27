import { useState } from 'react'

import { FileInput } from '../components/forms/FileInput'
import { SectionIntro } from '../components/ui/SectionIntro'
import { StatusMessage } from '../components/ui/StatusMessage'
import { usePageTitle } from '../hooks/usePageTitle'
import { portalService } from '../services/portalService'

const initialForm = {
  news_title: '',
  news_date: '',
  news_description: '',
  attachment: null,
  link_title: '',
  link_url: '',
  link_description: '',
}

export function UploadNewsLinksPage() {
  usePageTitle('Upload News & Links')

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
    Object.entries(form).forEach(([key, value]) => {
      if (value) {
        formData.append(key, value)
      }
    })

    setSubmitting(true)
    try {
      const response = await portalService.createNewsLinkEntry(formData)
      setStatus({ tone: 'success', message: response.data.message })
      setForm(initialForm)
    } catch (error) {
      setStatus({
        tone: 'error',
        message:
          error.response?.data?.non_field_errors?.[0] ||
          error.response?.data?.message ||
          'News or link upload failed.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page-container page-stack page-stack--wide">
      <section className="panel panel--admin">
        <SectionIntro
          badge="News & Important Links"
          title="Publish announcements and useful references"
          description="The combined teacher form still lives in one place, now backed by a single API submission."
        />

        <StatusMessage tone={status.tone}>{status.message}</StatusMessage>

        <form className="form-card" onSubmit={handleSubmit}>
          <div className="split-grid split-grid--equal">
            <div className="subpanel">
              <h3>News or Event</h3>
              <div className="form-stack">
                <label className="form-field" htmlFor="news-title">
                  <span>Title</span>
                  <input
                    id="news-title"
                    name="news_title"
                    onChange={handleChange}
                    placeholder="News or event title"
                    type="text"
                    value={form.news_title}
                  />
                </label>

                <label className="form-field" htmlFor="news-date">
                  <span>Date</span>
                  <input
                    id="news-date"
                    name="news_date"
                    onChange={handleChange}
                    type="date"
                    value={form.news_date}
                  />
                </label>

                <label className="form-field" htmlFor="news-description">
                  <span>Description</span>
                  <textarea
                    id="news-description"
                    name="news_description"
                    onChange={handleChange}
                    placeholder="Write a short description"
                    rows="5"
                    value={form.news_description}
                  />
                </label>

                <FileInput file={form.attachment} id="news-file" label="Attachment (Optional)" name="attachment" onChange={handleChange} />
              </div>
            </div>

            <div className="subpanel">
              <h3>Important Link</h3>
              <div className="form-stack">
                <label className="form-field" htmlFor="link-title">
                  <span>Link Title</span>
                  <input
                    id="link-title"
                    name="link_title"
                    onChange={handleChange}
                    placeholder="UGC Official Site"
                    type="text"
                    value={form.link_title}
                  />
                </label>

                <label className="form-field" htmlFor="link-url">
                  <span>URL</span>
                  <input
                    id="link-url"
                    name="link_url"
                    onChange={handleChange}
                    placeholder="https://example.com"
                    type="url"
                    value={form.link_url}
                  />
                </label>

                <label className="form-field" htmlFor="link-description">
                  <span>Description</span>
                  <textarea
                    id="link-description"
                    name="link_description"
                    onChange={handleChange}
                    placeholder="Why should students use this link?"
                    rows="5"
                    value={form.link_description}
                  />
                </label>
              </div>
            </div>
          </div>

          <button className="button" disabled={submitting} type="submit">
            {submitting ? 'Publishing...' : 'Submit Entry'}
          </button>
        </form>
      </section>
    </div>
  )
}
