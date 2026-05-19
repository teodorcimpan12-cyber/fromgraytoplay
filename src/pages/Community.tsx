import { useI18n } from '../lib/i18n';
import ActivityFeed from '../components/ActivityFeed';
import StatsRow from '../components/StatsRow';

export default function Community() {
  const { t } = useI18n();
  return (
    <section className="section">
      <div className="container">
        <span className="kicker">{t('nav.community')}</span>
        <h1>{t('community.title')}</h1>
        <p className="lead">{t('community.lead')}</p>
        <StatsRow />
        <div style={{ marginTop: '2rem' }}>
          <ActivityFeed limit={30} />
        </div>
      </div>
    </section>
  );
}
