import { Link } from 'react-router-dom';
import { useI18n } from '../lib/i18n';
import StatsRow from '../components/StatsRow';
import { COURTS } from '../data/courts';
import CourtCard from '../components/CourtCard';

export default function Home() {
  const { t } = useI18n();
  const featured = [...COURTS]
    .sort((a, b) => a.condition - b.condition)
    .slice(0, 3);

  return (
    <>
      <section className="hero">
        <div className="hero-grain" aria-hidden />
        <div className="container">
          <span className="kicker">{t('home.kicker')}</span>
          <h1 className="hero-title">
            <span className="grey-word">grey</span>
            <span className="arrow" aria-hidden>→</span>
            <span className="play-word">play</span>
          </h1>
          <p className="hero-lead">{t('home.lead')}</p>
          <div className="hero-actions">
            <Link to="/petition" className="btn btn-primary">{t('home.ctaPetition')}</Link>
            <Link to="/courts" className="btn btn-ghost">{t('home.ctaCourts')}</Link>
          </div>
          <StatsRow />
        </div>
      </section>

      <section className="section">
        <div className="container two-col">
          <div>
            <span className="kicker">01</span>
            <h2>{t('home.problemTitle')}</h2>
            <p>{t('home.problemBody')}</p>
          </div>
          <div className="problem-diptych" aria-hidden>
            <div className="diptych-half diptych-bright" />
            <div className="diptych-half diptych-grey" />
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <span className="kicker">02</span>
          <h2>{t('home.solutionTitle')}</h2>
          <div className="solution-grid">
            <article className="card solution-card">
              <span className="solution-icon" aria-hidden>🛠️</span>
              <h3>{t('home.solutionFlip')}</h3>
              <p>{t('home.solutionFlipBody')}</p>
            </article>
            <article className="card solution-card">
              <span className="solution-icon" aria-hidden>🎨</span>
              <h3>{t('home.solutionMural')}</h3>
              <p>{t('home.solutionMuralBody')}</p>
            </article>
            <article className="card solution-card">
              <span className="solution-icon" aria-hidden>👁️</span>
              <h3>{t('home.solutionAdopt')}</h3>
              <p>{t('home.solutionAdoptBody')}</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <span className="kicker">03</span>
          <h2>{t('courts.title')}</h2>
          <p className="dim">{t('courts.lead')}</p>
          <div className="cards-grid">
            {featured.map((c) => (
              <CourtCard key={c.id} court={c} />
            ))}
          </div>
          <div style={{ marginTop: '1.5rem' }}>
            <Link to="/courts" className="btn">{t('home.ctaAll')} →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
