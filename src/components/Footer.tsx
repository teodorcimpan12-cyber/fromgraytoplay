import { useI18n } from '../lib/i18n';

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>
          <strong className="mono">{t('meta.title')}</strong>
          <p className="muted">{t('about.byline')}</p>
        </div>
        <div className="footer-meta dim">
          <span>{t('footer.rights')}</span>
          <button
            className="btn-ghost btn"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            ↑ {t('footer.back')}
          </button>
        </div>
      </div>
    </footer>
  );
}
