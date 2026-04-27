export function LoadingState({ label = 'Loading content' }) {
  return (
    <div className="loading-state">
      <span className="loading-state__spinner" />
      <p>{label}</p>
    </div>
  )
}
