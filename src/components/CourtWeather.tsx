import { getCourtWeather } from '../lib/courtWeather';
import { useI18n } from '../lib/i18n';

interface Props {
  condition: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function CourtWeather({ condition, size = 'md', showLabel = true }: Props) {
  const w = getCourtWeather(condition);
  const { t } = useI18n();

  return (
    <span
      className={`weather weather-${size}`}
      style={{ background: w.bg, color: w.color, borderColor: w.color }}
      title={t(`weather.${w.key}Desc`)}
    >
      <span className="weather-icon" aria-hidden>{w.icon}</span>
      {showLabel && (
        <span className="weather-label">
          {t(`weather.${w.key}`)}
          <small className="weather-num"> · {Math.round(condition * 100)}</small>
        </span>
      )}
    </span>
  );
}
