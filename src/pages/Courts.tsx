import { useMemo, useState } from 'react';
import { useI18n } from '../lib/i18n';
import { COURTS, type Court } from '../data/courts';
import CourtCard from '../components/CourtCard';
import CourtMap from '../components/CourtMap';

type Filter = 'all' | 'central' | 'peripheral';
type View = 'list' | 'map';

export default function Courts() {
  const { t } = useI18n();
  const [filter, setFilter] = useState<Filter>('all');
  const [view, setView] = useState<View>('list');

  const courts = useMemo<Court[]>(() => {
    if (filter === 'all') return COURTS;
    return COURTS.filter((c) => c.side === filter);
  }, [filter]);

  return (
    <section className="section">
      <div className="container">
        <span className="kicker">{t('nav.courts')}</span>
        <h1>{t('courts.title')}</h1>
        <p className="dim">{t('courts.lead')}</p>

        <div className="controls-row">
          <div className="seg">
            {(['all', 'central', 'peripheral'] as Filter[]).map((f) => (
              <button
                key={f}
                className={`seg-btn ${filter === f ? 'is-active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {t(`courts.filter${f.charAt(0).toUpperCase() + f.slice(1)}`)}
              </button>
            ))}
          </div>

          <div className="seg">
            <button
              className={`seg-btn ${view === 'list' ? 'is-active' : ''}`}
              onClick={() => setView('list')}
            >
              {t('courts.showList')}
            </button>
            <button
              className={`seg-btn ${view === 'map' ? 'is-active' : ''}`}
              onClick={() => setView('map')}
            >
              {t('courts.showMap')}
            </button>
          </div>
        </div>

        {courts.length === 0 ? (
          <p className="muted">{t('courts.noResults')}</p>
        ) : view === 'list' ? (
          <div className="cards-grid">
            {courts.map((c) => <CourtCard key={c.id} court={c} />)}
          </div>
        ) : (
          <CourtMap courts={courts} height={520} />
        )}
      </div>
    </section>
  );
}
