import { Link } from 'react-router-dom';
import { useI18n } from '../lib/i18n';

export default function Help() {
  const { t } = useI18n();
  const ways = [
    { key: 'One', icon: '✍️', to: '/petition' },
    { key: 'Two', icon: '📸', to: '/courts' },
    { key: 'Three', icon: '👁️', to: '/community' },
  ] as const;
  return (
    <section className="section">
      <div className="container">
        <span className="kicker">{t('nav.help')}</span>
        <h1>{t('help.title')}</h1>
        <p className="lead">{t('help.lead')}</p>

        <div className="ways-grid">
          {ways.map((w) => (
            <Link to={w.to} key={w.key} className="card way-card">
              <span className="way-icon" aria-hidden>{w.icon}</span>
              <h3>{t(`help.way${w.key}Title`)}</h3>
              <p>{t(`help.way${w.key}Body`)}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
