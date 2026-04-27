import {
  Bot,
  ChevronDown,
  Eraser,
  LoaderCircle,
  SendHorizontal,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { assistantService } from '../../services/assistantService'

const PAGE_LABELS = {
  '/': 'Home',
  '/course': 'Courses',
  '/syllabus': 'Syllabus',
  '/home_assignments': 'Assignments',
  '/unit_tests': 'Unit Tests',
  '/question_papers': 'Question Papers',
  '/practicals': 'Practicals',
  '/dashboard': 'Dashboard',
  '/upload-assignment': 'Upload Assignment',
  '/upload_news_links': 'Upload News & Links',
  '/upload_question_paper': 'Upload Question Paper',
  '/upload_syllabus': 'Upload Syllabus',
  '/upload_unit_test': 'Upload Unit Test',
  '/create_unit_test': 'Create Unit Test',
  '/login': 'Login',
}

const SUGGESTIONS_BY_PAGE = {
  '/': [
    'What resources can I find on this portal?',
    'Show me the latest academic updates.',
    'How should I use this portal for exam preparation?',
  ],
  '/syllabus': [
    'What syllabus files are available here?',
    'How can I understand a syllabus quickly before exams?',
    'Create a simple study plan from a syllabus.',
  ],
  '/home_assignments': [
    'How should I complete assignments faster?',
    'Explain how to solve assignment questions step by step.',
    'Give me a checklist before submitting an assignment.',
  ],
  '/unit_tests': [
    'How should I prepare for unit tests in less time?',
    'Turn unit test material into a quick revision plan.',
    'What answer structure works best in unit tests?',
  ],
  '/question_papers': [
    'How do I use previous papers effectively?',
    'Give me a past-paper solving strategy.',
    'What topics usually repeat in exams?',
  ],
  '/practicals': [
    'How should I write practical answers clearly?',
    'Give me a practical exam preparation checklist.',
    'Explain viva preparation in simple language.',
  ],
  default: [
    'Explain DBMS normalization simply.',
    'Give me a 5-mark answer on operating systems.',
    'Help me find study material on this portal.',
  ],
}

function createMessage(role, content, extra = {}) {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    sources: extra.sources || [],
    kind: extra.kind || 'chat',
    errored: Boolean(extra.errored),
  }
}

function getPageTitle(pathname) {
  return PAGE_LABELS[pathname] || 'this page'
}

function getSuggestions(pathname) {
  return SUGGESTIONS_BY_PAGE[pathname] || SUGGESTIONS_BY_PAGE.default
}

function toHistory(messages) {
  return messages
    .filter((message) => message.role === 'user' || message.role === 'assistant')
    .slice(-6)
    .map((message) => ({
      role: message.role,
      content: message.content,
    }))
}

export function GlobalAssistant() {
  const location = useLocation()
  const pageTitle = getPageTitle(location.pathname)
  const suggestions = getSuggestions(location.pathname)

  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [messages, setMessages] = useState([])
  const scrollRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    if (!open || !scrollRef.current) {
      return
    }

    scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, open, submitting])

  useEffect(() => {
    if (!open || !textareaRef.current) {
      return
    }

    textareaRef.current.focus()
  }, [open])

  async function submitPrompt(presetMessage = '') {
    const nextPrompt = (presetMessage || input).trim()
    if (!nextPrompt || submitting) {
      return
    }

    const userMessage = createMessage('user', nextPrompt)
    const nextMessages = [...messages, userMessage]

    setOpen(true)
    setMessages(nextMessages)
    setInput('')
    setSubmitting(true)

    try {
      const response = await assistantService.chat({
        message: nextPrompt,
        history: toHistory(nextMessages),
        page_path: location.pathname,
        page_title: pageTitle,
      })

      setMessages((current) => [
        ...current,
        createMessage('assistant', response.data.reply, {
          sources: response.data.sources,
        }),
      ])
    } catch (error) {
      const fallback =
        error.response?.data?.message ||
        'The assistant could not respond right now. Please verify the AI configuration and try again.'

      setMessages((current) => [
        ...current,
        createMessage('assistant', fallback, {
          errored: true,
        }),
      ])
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    await submitPrompt()
  }

  async function handleSuggestionClick(prompt) {
    await submitPrompt(prompt)
  }

  async function handleInputKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      await submitPrompt()
    }
  }

  function handleClearChat() {
    setMessages([])
    setInput('')
  }

  return (
    <div className={`assistant-widget ${open ? 'assistant-widget--open' : ''}`}>
      <button
        aria-controls="portal-assistant-panel"
        aria-expanded={open}
        className="assistant-toggle"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span className="assistant-toggle__icon">
          {open ? <ChevronDown size={18} /> : <Bot size={18} />}
        </span>
        <span className="assistant-toggle__copy">
          <strong>Ask Anything</strong>
          <small>AI academic assistant</small>
        </span>
      </button>

      {open ? (
        <section className="assistant-panel panel" id="portal-assistant-panel">
          <header className="assistant-panel__header">
            <div className="assistant-panel__title">
              <div>
                <strong>Ask Anything</strong>
                <small>{pageTitle}</small>
              </div>
            </div>

            <div className="assistant-panel__actions">
              <button className="icon-button" onClick={handleClearChat} title="Clear chat" type="button">
                <Eraser size={16} />
              </button>
              <button className="icon-button" onClick={() => setOpen(false)} title="Close assistant" type="button">
                <X size={16} />
              </button>
            </div>
          </header>

          {!messages.length ? (
            <div className="assistant-suggestions">
              {suggestions.map((prompt) => (
                <button
                  className="assistant-suggestion"
                  key={prompt}
                  onClick={() => handleSuggestionClick(prompt)}
                  type="button"
                >
                  {prompt}
                </button>
              ))}
            </div>
          ) : null}

          <div className="assistant-messages" ref={scrollRef}>
            {messages.map((message) => (
              <article
                className={`assistant-bubble assistant-bubble--${message.role} ${
                  message.errored ? 'assistant-bubble--error' : ''
                }`}
                key={message.id}
              >
                <p>{message.content}</p>
                {message.sources?.length ? (
                  <div className="assistant-sources">
                    {message.sources.map((source) => (
                      <span className="assistant-source" key={`${message.id}-${source.label}`}>
                        {source.label}
                      </span>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}

            {submitting ? (
              <article className="assistant-bubble assistant-bubble--assistant assistant-bubble--typing">
                <div className="assistant-typing">
                  <LoaderCircle className="assistant-typing__spinner" size={16} />
                  <span>Thinking...</span>
                </div>
              </article>
            ) : null}
          </div>

          <form className="assistant-composer" onSubmit={handleSubmit}>
            <textarea
              className="assistant-composer__input"
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Ask an academic question or request help from this page..."
              ref={textareaRef}
              rows={2}
              value={input}
            />
            <button className="button assistant-composer__submit" disabled={submitting || !input.trim()} type="submit">
              <SendHorizontal size={16} />
              <span>Send</span>
            </button>
          </form>
        </section>
      ) : null}
    </div>
  )
}
