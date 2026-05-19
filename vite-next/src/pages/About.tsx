import { useI18n } from '../lib/i18n';

export default function About() {
  const { t } = useI18n();
  return (
    <section className="section">
      <div className="container narrow">
        <span className="kicker">{t('nav.about')}</span>
        <h1>{t('about.title')}</h1>
        <p className="lead">{t('about.lead')}</p>

        <dl className="about-list">
          <dt className="mono dim">{t('about.contact')}</dt>
          <dd><a href="mailto:hello@fromgreytoplay.ro">hello@fromgreytoplay.ro</a></dd>

          <dt className="mono dim">{t('about.github')}</dt>
          <dd><a href="https://github.com/teodorcimpan12-cyber/fromgraytoplay">github.com/teodorcimpan12-cyber/fromgraytoplay</a></dd>

          <dt className="mono dim">{t('about.license')}</dt>
          <dd>CC BY 4.0</dd>
        </dl>

        <p className="dim mono small" style={{ marginTop: '2rem' }}>{t('about.byline')}</p>
      </div>
    </section>
  );
}
