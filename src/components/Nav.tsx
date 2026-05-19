import { NavLink, Link } from 'react-router-dom';
import { useState } from 'react';
import { useI18n } from '../lib/i18n';
import LangSwitcher from './LangSwitcher';

const items = [
  { to: '/', key: 'home', end: true },
  { to: '/courts', key: 'courts' },
  { to: '/petition', key: 'petition' },
  { to: '/community', key: 'community' },
  { to: '/impact', key: 'impact' },
  { to: '/help', key: 'help' },
  { to: '/about', key: 'about' },
] as const;

export default function Nav() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <header className="site-nav">
      <div className="container nav-inner">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark" aria-hidden>FG→P</span>
          <span className="brand-text">{t('meta.title')}</span>
        </Link>

        <button
          className="nav-toggle"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span /><span /><span />
        </button>

        <nav className={`nav-links ${open ? 'is-open' : ''}`}>
          {items.map((it) => (
            <NavLink
              key={it.key}
              to={it.to}
              end={'end' in it ? it.end : false}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}
            >
              {t(`nav.${it.key}`)}
            </NavLink>
          ))}
          <LangSwitcher />
        </nav>
      </div>
    </header>
  );
}
