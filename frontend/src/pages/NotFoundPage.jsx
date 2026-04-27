import { Link } from 'react-router-dom'

import { usePageTitle } from '../hooks/usePageTitle'

export function NotFoundPage() {
  usePageTitle('Not Found')

  return (
    <div className="page-container page-stack page-stack--narrow">
      <section className="panel not-found-panel">
        <span className="section-intro__badge">404</span>
        <h1>That page wandered off</h1>
        <p>The route exists nowhere useful, but the rest of the portal is still right here.</p>
        <div className="button-row button-row--center">
          <Link className="button" to="/">
            Go Home
          </Link>
          <Link className="button button--secondary" to="/dashboard">
            Admin Dashboard
          </Link>
        </div>
      </section>
    </div>
  )
}
