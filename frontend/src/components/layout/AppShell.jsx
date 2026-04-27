import { ArrowLeft, LogOut } from 'lucide-react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'

import campusImage from '../../../static/image/university.jpg'
import { GlobalAssistant } from '../ai/GlobalAssistant'
import { useAuth } from '../../context/AuthContext'
import { Navigation } from './Navigation'

const adminPaths = [
  '/dashboard',
  '/upload-assignment',
  '/upload_news_links',
  '/upload_question_paper',
  '/upload_syllabus',
  '/upload_unit_test',
  '/create_unit_test',
]

export function AppShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const { authenticated, logout } = useAuth()

  const isLoginRoute = location.pathname === '/login'
  const isAdminArea = adminPaths.includes(location.pathname)
  const showPublicChrome = !isLoginRoute && !isAdminArea

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div className="app-shell" style={{ '--portal-bg-image': `url(${campusImage})` }}>
      {showPublicChrome ? <Navigation /> : null}

      {isAdminArea ? (
        <div className="admin-topbar">
          <div className="page-container admin-topbar__inner">
            <button
              className="ghost-button"
              onClick={() => navigate(location.pathname === '/dashboard' ? '/' : '/dashboard')}
              type="button"
            >
              <ArrowLeft size={16} />
              <span>{location.pathname === '/dashboard' ? 'Portal Home' : 'Back to Dashboard'}</span>
            </button>

            <Link className="brand brand--compact" to="/">
              <img
                alt=""
                aria-hidden="true"
                className="brand__mark"
                decoding="async"
                height="46"
                src="/brand/vidyarthi-mitra-symbol.svg"
                width="46"
              />
              <span className="brand__copy">
                <strong>Vidyarthi Mitra</strong>
              </span>
            </Link>

            {authenticated ? (
              <button className="ghost-button" onClick={handleLogout} type="button">
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            ) : (
              <span className="topbar-spacer" />
            )}
          </div>
        </div>
      ) : null}

      {isLoginRoute ? (
        <div className="login-topbar page-container">
          <Link className="ghost-button" to="/">
            <ArrowLeft size={16} />
            <span>Back</span>
          </Link>
        </div>
      ) : null}

      <main className={`page-shell ${showPublicChrome ? 'page-shell--public' : 'page-shell--admin'}`}>
        <Outlet />
      </main>

      <GlobalAssistant />
    </div>
  )
}
