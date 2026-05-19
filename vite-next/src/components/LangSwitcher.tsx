import { useI18n, langFlags, type Lang } from '../lib/i18n';

const order: Lang[] = ['ro', 'en', 'hu'];

export default function LangSwitcher() {
  const { lang, setLang, t } = useI18n();
  return (
    <div className="lang-switcher" role="group" aria-label={t('lang.label')}>
      {order.map((code) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          className={`lang-btn ${lang === code ? 'is-active' : ''}`}
          aria-pressed={lang === code}
          title={t(`lang.${code}`)}
        >
          {langFlags[code]}
        </button>
      ))}
    </div>
  );
}
