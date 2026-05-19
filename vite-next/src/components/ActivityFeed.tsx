import { useEffect, useState } from 'react';
import { onValue, query, ref, limitToLast } from 'firebase/database';
import { formatDistanceToNow } from 'date-fns';
import { ro, hu, enUS } from 'date-fns/locale';
import { db, firebaseEnabled } from '../lib/firebase';
import { useI18n, type Lang } from '../lib/i18n';
import { COURTS } from '../data/courts';

export type ActivityType = 'check-in' | 'petition' | 'photo' | 'report' | 'game';

export interface ActivityEntry {
  id: string;
  type: ActivityType;
  userName: string;
  courtId?: string;
  timestamp: number;
}

const ICONS: Record<ActivityType, string> = {
  'check-in': '🏀',
  petition: '✍️',
  photo: '📸',
  report: '⚠️',
  game: '🎯',
};

const localeFor = (lang: Lang) => (lang === 'ro' ? ro : lang === 'hu' ? hu : enUS);

export default function ActivityFeed({ limit = 20 }: { limit?: number }) {
  const { t, lang } = useI18n();
  const [items, setItems] = useState<ActivityEntry[]>([]);

  useEffect(() => {
    if (!firebaseEnabled || !db) return;
    const q = query(ref(db, 'activity'), limitToLast(limit));
    return onValue(q, (snap) => {
      const data = (snap.val() ?? {}) as Record<string, Omit<ActivityEntry, 'id'>>;
      const entries = Object.entries(data)
        .map(([id, v]) => ({ id, ...v }))
        .sort((a, b) => b.timestamp - a.timestamp);
      setItems(entries);
    });
  }, [limit]);

  const courtName = (id?: string) => {
    if (!id) return '';
    return COURTS.find((c) => c.id === id)?.name ?? id;
  };

  const message = (a: ActivityEntry) => {
    const key = `community.feed${a.type === 'check-in' ? 'Checkin' : a.type.charAt(0).toUpperCase() + a.type.slice(1)}`;
    return t(key, { name: a.userName || 'Anon', court: courtName(a.courtId) });
  };

  if (!firebaseEnabled) {
    return (
      <div className="activity-feed">
        <h3>{t('community.feedTitle')}</h3>
        <p className="muted small">
          Live feed is offline. Add Firebase env vars to <code>.env</code> to enable.
        </p>
      </div>
    );
  }

  return (
    <div className="activity-feed">
      <h3>
        <span className="pulse-dot" aria-hidden /> {t('community.feedTitle')}
      </h3>
      {items.length === 0 ? (
        <p className="muted">{t('community.feedEmpty')}</p>
      ) : (
        <ul className="feed-list">
          {items.map((a, i) => (
            <li
              key={a.id}
              className={`feed-item ${i === 0 ? 'is-newest' : ''}`}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <span className="feed-icon" aria-hidden>{ICONS[a.type] ?? '•'}</span>
              <div className="feed-body">
                <p>{message(a)}</p>
                <time>
                  {formatDistanceToNow(a.timestamp, { locale: localeFor(lang), addSuffix: true })}
                </time>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
