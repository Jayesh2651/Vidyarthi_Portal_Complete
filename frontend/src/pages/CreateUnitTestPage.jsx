import { Minus, Pilcrow, Sigma, Type, Download } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { SectionIntro } from '../components/ui/SectionIntro'
import { StatusMessage } from '../components/ui/StatusMessage'
import { usePageTitle } from '../hooks/usePageTitle'
import { portalService } from '../services/portalService'

function MathFieldBlock({ value, onChange }) {
  const ref = useRef(null)

  useEffect(() => {
    const field = ref.current
    if (!field) return

    field.value = value

    const handleInput = () => {
      onChange(field.value)
    }

    field.addEventListener('input', handleInput)
    return () => field.removeEventListener('input', handleInput)
  }, [onChange, value])

  useEffect(() => {
    const field = ref.current
    if (field && field.value !== value) {
      field.value = value
    }
  }, [value])

  return <math-field className="math-field" ref={ref} virtual-keyboard-mode="onfocus"></math-field>
}

function createBlock(type) {
  return {
    id: `${type}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type,
    value: '',
  }
}

function buildPreviewHtml(blocks) {
  return blocks
    .map((block) => {
      const value = block.value.trim()
      if (!value) return ''

      if (block.type === 'heading') {
        return `<h2>${value}</h2>`
      }

      if (block.type === 'text') {
        return `<p>${value}</p>`
      }

      return `<div class="math-preview">$$${value}$$</div>`
    })
    .join('')
}

export function CreateUnitTestPage() {
  usePageTitle('Create Unit Test')

  const [blocks, setBlocks] = useState([createBlock('heading'), createBlock('text')])
  const [status, setStatus] = useState({ tone: 'info', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const previewRef = useRef(null)
  const previewHtml = buildPreviewHtml(blocks)

  useEffect(() => {
    if (!previewRef.current || !window.MathJax?.typesetPromise) return
    window.MathJax.typesetPromise([previewRef.current]).catch(() => {})
  }, [previewHtml])

  function addBlock(type) {
    setBlocks((current) => [...current, createBlock(type)])
  }

  function updateBlock(id, value) {
    setBlocks((current) =>
      current.map((block) => (block.id === id ? { ...block, value } : block)),
    )
  }

  function removeBlock(id) {
    setBlocks((current) => current.filter((block) => block.id !== id))
  }

  async function handleDownload() {
    if (!previewRef.current?.innerHTML.trim()) {
      setStatus({ tone: 'error', message: 'Add some content before downloading the PDF.' })
      return
    }

    setSubmitting(true)
    setStatus({ tone: 'info', message: '' })

    try {
      const response = await portalService.downloadPdf(previewRef.current.innerHTML)
      const blobUrl = window.URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = 'question_paper.pdf'
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(blobUrl)
      setStatus({ tone: 'success', message: 'PDF downloaded successfully.' })
    } catch (error) {
      setStatus({
        tone: 'error',
        message: error.response?.data?.message || 'PDF generation failed.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page-container page-stack">
      <section className="panel panel--admin">
        <SectionIntro
          badge="Create Unit Test"
          title="Question paper editor"
          description="A React alternative to the original HTML editor, still supporting headings, paragraphs, LaTeX input, live preview, and PDF download."
        />

        <StatusMessage tone={status.tone}>{status.message}</StatusMessage>

        <div className="math-workbench">
          <div className="editor-column">
            <div className="editor-toolbar">
              <button className="button button--secondary" onClick={() => addBlock('heading')} type="button">
                <Type size={16} />
                <span>Heading</span>
              </button>
              <button className="button button--secondary" onClick={() => addBlock('text')} type="button">
                <Pilcrow size={16} />
                <span>Paragraph</span>
              </button>
              <button className="button button--secondary" onClick={() => addBlock('latex')} type="button">
                <Sigma size={16} />
                <span>Equation</span>
              </button>
            </div>

            <div className="editor-stack">
              {blocks.map((block) => (
                <article className="editor-block" key={block.id}>
                  <div className="editor-block__header">
                    <span>{block.type === 'latex' ? 'Equation' : block.type === 'heading' ? 'Heading' : 'Paragraph'}</span>
                    <button className="icon-button" onClick={() => removeBlock(block.id)} type="button">
                      <Minus size={16} />
                    </button>
                  </div>

                  {block.type === 'latex' ? (
                    <MathFieldBlock value={block.value} onChange={(value) => updateBlock(block.id, value)} />
                  ) : (
                    <textarea
                      onChange={(event) => updateBlock(block.id, event.target.value)}
                      placeholder={block.type === 'heading' ? 'Heading...' : 'Paragraph...'}
                      rows={block.type === 'heading' ? 2 : 4}
                      value={block.value}
                    />
                  )}
                </article>
              ))}
            </div>
          </div>

          <div className="preview-column">
            <div className="preview-column__header">
              <h3>Live Preview</h3>
              <button className="button" disabled={submitting} onClick={handleDownload} type="button">
                <Download size={16} />
                <span>{submitting ? 'Generating...' : 'Download PDF'}</span>
              </button>
            </div>
            <div
              className="preview-pane"
              dangerouslySetInnerHTML={{ __html: previewHtml || '<p>Start adding content to preview the question paper.</p>' }}
              ref={previewRef}
            />
          </div>
        </div>
      </section>
    </div>
  )
}
