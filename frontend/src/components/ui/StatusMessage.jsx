export function StatusMessage({ children, tone = 'info' }) {
  if (!children) return null

  return <div className={`status-message status-message--${tone}`}>{children}</div>
}
