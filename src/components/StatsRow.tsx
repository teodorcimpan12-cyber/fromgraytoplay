import { useEffect, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { db, firebaseEnabled } from '../lib/firebase';
import { useI18n } from '../lib/i18n';
import { COURTS } from '../data/courts';
import { formatNumber } from '../lib/utils';

export default function StatsRow() {
  const { t } = useI18n();
  const [signatures, setSignatures] = useState(0);
  const [checkins, setCheckins] = useState(0);

  useEffect(() => {
    if (!firebaseEnabled || !db) return;
    const unsubA = onValue(ref(db, 'votes'), (snap) => {
      const v = (snap.val() ?? {}) as Record<string, number>;
      setSignatures((v.flip ?? 0) + (v.mural ?? 0) + (v.both ?? 0));
    });
    const unsubB = onValue(ref(db, 'activity'), (snap) => {
      const a = (snap.val() ?? {}) as Record<string, { type: string }>;
      setCheckins(Object.values(a).filter((x) => x.type === 'check-in').length);
    });
    return () => {
      unsubA();
      unsubB();
    };
  }, []);

  return (
    <div className="stats-row">
      <div className="stat">
        <span className="stat-num mono">{COURTS.length}</span>
        <span className="stat-label dim">{t('home.statsCourts')}</span>
      </div>
      <div className="stat">
        <span className="stat-num mono">{formatNumber(signatures)}</span>
        <span className="stat-label dim">{t('home.statsSignatures')}</span>
      </div>
      <div className="stat">
        <span className="stat-num mono">{formatNumber(checkins)}</span>
        <span className="stat-label dim">{t('home.statsCheckins')}</span>
      </div>
    </div>
  );
}
