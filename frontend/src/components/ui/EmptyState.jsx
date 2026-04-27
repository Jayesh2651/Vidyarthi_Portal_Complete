import { Inbox } from 'lucide-react'

export function EmptyState({ title, description }) {
  return (
    <div className="empty-state">
      <Inbox size={24} />
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
}
