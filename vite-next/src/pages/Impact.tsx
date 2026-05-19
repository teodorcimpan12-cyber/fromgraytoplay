import { useEffect, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { useI18n } from '../lib/i18n';
import { COURTS } from '../data/courts';
import { db, firebaseEnabled } from '../lib/firebase';
import { formatNumber } from '../lib/utils';

export default function Impact() {
  const { t } = useI18n();
  const [signatures, setSignatures] = useState(0);

  useEffect(() => {
    if (!firebaseEnabled || !db) return;
    return onValue(ref(db, 'votes'), (snap) => {
      const v = (snap.val() ?? {}) as Record<string, number>;
      setSignatures((v.flip ?? 0) + (v.mural ?? 0) + (v.both ?? 0));
    });
  }, []);

  const neighborhoods = new Set(COURTS.map((c) => c.neighborhood)).size;
  const degradedPeripheral = COURTS.filter(
    (c) => c.side === 'peripheral' && c.condition < 0.4
  ).length;

  return (
    <section className="section">
      <div className="container">
        <span className="kicker">{t('nav.impact')}</span>
        <h1>{t('impact.title')}</h1>
        <p className="lead">{t('impact.lead')}</p>

        <div className="metrics-grid">
          <Metric value={COURTS.length} label={t('impact.metricCourts')} />
          <Metric value={signatures} label={t('impact.metricSignatures')} />
          <Metric value={neighborhoods} label={t('impact.metricNeighborhoods')} />
          <Metric value={degradedPeripheral} label={t('impact.metricPeripheral')} accent />
        </div>

        <div className="card" style={{ marginTop: '2rem' }}>
          <h3>{t('impact.explainTitle')}</h3>
          <p>{t('impact.explainBody')}</p>
        </div>
      </div>
    </section>
  );
}

function Metric({ value, label, accent }: { value: number; label: string; accent?: boolean }) {
  return (
    <div className={`metric ${accent ? 'metric-accent' : ''}`}>
      <span className="metric-num mono">{formatNumber(value)}</span>
      <span className="metric-label">{label}</span>
    </div>
  );
}
