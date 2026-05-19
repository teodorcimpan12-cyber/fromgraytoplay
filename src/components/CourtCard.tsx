import { Link } from 'react-router-dom';
import { useI18n } from '../lib/i18n';
import CourtWeather from './CourtWeather';
import type { Court } from '../data/courts';

export default function CourtCard({ court }: { court: Court }) {
  const { t, lang } = useI18n();
  return (
    <Link to={`/courts/${court.id}`} className="court-card card">
      <div className="court-card-head">
        <h3>{court.name}</h3>
        <CourtWeather condition={court.condition} size="sm" />
      </div>
      <p className="court-card-meta mono dim">
        {t(`court.${court.side}`)} · {court.neighborhood}
      </p>
      <p className="court-card-note">{court.note[lang]}</p>
      <span className="court-card-cta mono">{t('courts.openDetail')} →</span>
    </Link>
  );
}
