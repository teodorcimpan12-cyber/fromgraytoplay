import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { push, ref, set } from 'firebase/database';
import { COURTS } from '../data/courts';
import { useI18n } from '../lib/i18n';
import CourtWeather from '../components/CourtWeather';
import CourtMap from '../components/CourtMap';
import { db, firebaseEnabled, getUserId } from '../lib/firebase';
import { anonymizeName } from '../lib/utils';

export default function CourtDetail() {
  const { id } = useParams<{ id: string }>();
  const { t, lang } = useI18n();
  const court = COURTS.find((c) => c.id === id);
  const [checkedIn, setCheckedIn] = useState(false);

  useEffect(() => {
    setCheckedIn(false);
  }, [id]);

  if (!court) {
    return (
      <section className="section">
        <div className="container">
          <Link to="/courts" className="mono">← {t('court.back')}</Link>
          <h1>404</h1>
        </div>
      </section>
    );
  }

  async function checkIn() {
    if (!firebaseEnabled || !db || !court) return;
    const userId = getUserId();
    const name = anonymizeName(localStorage.getItem('fgtp-name') || 'Anon');
    const session = push(ref(db, `courts/${court.id}/checkins`));
    await set(session, { userId, timestamp: Date.now(), action: 'arrived' });
    const a = push(ref(db, 'activity'));
    await set(a, {
      type: 'check-in',
      userName: name,
      courtId: court.id,
      timestamp: Date.now(),
    });
    setCheckedIn(true);
  }

  async function report() {
    if (!firebaseEnabled || !db || !court) return;
    const userId = getUserId();
    const name = anonymizeName(localStorage.getItem('fgtp-name') || 'Anon');
    const r = push(ref(db, 'reports'));
    await set(r, { courtId: court.id, userId, status: 'open', timestamp: Date.now() });
    const a = push(ref(db, 'activity'));
    await set(a, {
      type: 'report',
      userName: name,
      courtId: court.id,
      timestamp: Date.now(),
    });
  }

  return (
    <section className="section">
      <div className="container">
        <Link to="/courts" className="mono dim back-link">← {t('court.back')}</Link>

        <header className="court-header">
          <div>
            <span className="kicker">{t(`court.${court.side}`)} · {court.neighborhood}</span>
            <h1>{court.name}</h1>
          </div>
          <CourtWeather condition={court.condition} size="lg" />
        </header>

        <p className="lead">{court.note[lang]}</p>

        <div className="court-detail-grid">
          <div className="card">
            <h3>{t('court.lastActivity')}</h3>
            <p className="dim small">
              {firebaseEnabled
                ? 'Real-time updates appear here once activity flows in.'
                : 'Connect Firebase to enable live activity.'}
            </p>
            <div className="court-actions">
              <button className="btn btn-primary" onClick={checkIn} disabled={checkedIn || !firebaseEnabled}>
                {checkedIn ? '✓ ' + t('court.checkIn') : t('court.checkIn')}
              </button>
              <button className="btn" onClick={report} disabled={!firebaseEnabled}>
                {t('court.report')}
              </button>
            </div>
          </div>

          <CourtMap courts={COURTS} height={360} focusId={court.id} />
        </div>
      </div>
    </section>
  );
}
