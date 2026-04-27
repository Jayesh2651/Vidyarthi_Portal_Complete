import { Menu, ShieldCheck, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'
import { publicNavigation } from '../../data/portalContent'

export function Navigation() {
  const [open, setOpen] = useState(false)
  const { authenticated } = useAuth()

  function closeMenu() {
    setOpen(false)
  }

  return (
    <header className="site-header">
      <div className="site-header__inner page-container">
        <Link className="brand" to="/" onClick={closeMenu}>
          <img
            alt=""
            aria-hidden="true"
            className="brand__mark"
            decoding="async"
            height="54"
            src="/brand/vidyarthi-mitra-symbol.svg"
            width="54"
          />
          <span className="brand__copy">
            <strong>Vidyarthi Mitra</strong>
            <small>Academic Portal</small>
          </span>
        </Link>

        <button
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          className="mobile-toggle"
          onClick={() => setOpen((current) => !current)}
          type="button"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>

        <nav className={`site-nav ${open ? 'site-nav--open' : ''}`}>
          {publicNavigation.map((item) => (
            <NavLink
              key={item.path}
              className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}
              onClick={closeMenu}
              to={item.path}
            >
              {item.label}
            </NavLink>
          ))}
          <NavLink
            className={({ isActive }) =>
              `nav-link nav-link--button ${isActive ? 'nav-link--active' : ''}`
            }
            onClick={closeMenu}
            to={authenticated ? '/dashboard' : '/login'}
          >
            <ShieldCheck size={16} />
            <span>{authenticated ? 'Dashboard' : 'Login'}</span>
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
