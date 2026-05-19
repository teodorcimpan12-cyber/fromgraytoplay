import { useEffect, useState, type FormEvent } from 'react';
import { onValue, push, ref, runTransaction, set } from 'firebase/database';
import { db, firebaseEnabled, getUserId } from '../lib/firebase';
import { useI18n } from '../lib/i18n';
import { anonymizeName, formatNumber } from '../lib/utils';

type Choice = 'flip' | 'mural' | 'both';

interface Votes {
  flip: number;
  mural: number;
  both: number;
}

const GOAL = 500;

export default function PetitionForm() {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [choice, setChoice] = useState<Choice>('both');
  const [volunteer, setVolunteer] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [votes, setVotes] = useState<Votes>({ flip: 0, mural: 0, both: 0 });

  useEffect(() => {
    if (!firebaseEnabled || !db) return;
    return onValue(ref(db, 'votes'), (snap) => {
      const v = (snap.val() ?? {}) as Partial<Votes>;
      setVotes({ flip: v.flip ?? 0, mural: v.mural ?? 0, both: v.both ?? 0 });
    });
  }, []);

  const total = votes.flip + votes.mural + votes.both;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !email.trim()) {
      setError(t('petition.errorRequired'));
      return;
    }
    if (!firebaseEnabled || !db) {
      setError(t('petition.errorOffline'));
      return;
    }
    setSubmitting(true);
    try {
      const userId = getUserId();
      const signup = push(ref(db, 'signups'));
      await set(signup, {
        userId,
        name: name.trim(),
        email: email.trim(),
        choice,
        volunteer,
        timestamp: Date.now(),
      });
      await runTransaction(ref(db, `votes/${choice}`), (cur) => (cur ?? 0) + 1);
      const activity = push(ref(db, 'activity'));
      await set(activity, {
        type: 'petition',
        userName: anonymizeName(name),
        timestamp: Date.now(),
      });
      setDone(true);
      setName('');
      setEmail('');
    } catch (err) {
      console.error(err);
      setError(t('petition.errorOffline'));
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="petition-thanks card">
        <span className="huge" aria-hidden>✓</span>
        <h3>{t('petition.thanks')}</h3>
        <p className="dim">
          {t('petition.currentCount', { count: formatNumber(total + 1) })}
        </p>
      </div>
    );
  }

  return (
    <form className="petition-form card" onSubmit={onSubmit}>
      <div className="petition-progress">
        <div className="bar-bg">
          <div
            className="bar-fill"
            style={{ width: `${Math.min(100, (total / GOAL) * 100)}%` }}
          />
        </div>
        <p className="mono dim small">
          {t('petition.goalProgress', { count: formatNumber(total), goal: formatNumber(GOAL) })}
        </p>
      </div>

      <label className="field">
        <span>{t('petition.nameLabel')}</span>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('petition.namePh')}
          autoComplete="name"
        />
      </label>

      <label className="field">
        <span>{t('petition.emailLabel')}</span>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('petition.emailPh')}
          autoComplete="email"
        />
      </label>

      <fieldset className="field">
        <legend>{t('petition.choiceLabel')}</legend>
        <div className="choice-row">
          {(['flip', 'mural', 'both'] as Choice[]).map((c) => (
            <label key={c} className={`choice-chip ${choice === c ? 'is-selected' : ''}`}>
              <input
                type="radio"
                name="choice"
                value={c}
                checked={choice === c}
                onChange={() => setChoice(c)}
              />
              <span>{t(`petition.choice${c.charAt(0).toUpperCase() + c.slice(1)}`)}</span>
              <small className="dim mono">{votes[c]}</small>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="field volunteer">
        <input
          type="checkbox"
          checked={volunteer}
          onChange={(e) => setVolunteer(e.target.checked)}
        />
        <span>{t('petition.volunteerLabel')}</span>
      </label>

      {error && <p className="form-error">{error}</p>}

      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? t('petition.submitting') : t('petition.submit')}
      </button>
    </form>
  );
}
