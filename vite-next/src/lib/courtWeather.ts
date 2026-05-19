export type WeatherKey = 'excellent' | 'good' | 'okay' | 'poor' | 'broken';

export interface CourtWeather {
  key: WeatherKey;
  icon: string;
  color: string;
  bg: string;
  /** 0-1 value used by progress bars and shaders. */
  fill: number;
}

export function getCourtWeather(condition: number): CourtWeather {
  const c = Math.max(0, Math.min(1, condition));
  if (c >= 0.8) return { key: 'excellent', icon: '☀️', color: '#10B981', bg: 'rgba(16,185,129,0.12)', fill: c };
  if (c >= 0.6) return { key: 'good',      icon: '🌤️', color: '#22C55E', bg: 'rgba(34,197,94,0.12)',  fill: c };
  if (c >= 0.4) return { key: 'okay',      icon: '⛅', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', fill: c };
  if (c >= 0.2) return { key: 'poor',      icon: '🌧️', color: '#F97316', bg: 'rgba(249,115,22,0.12)', fill: c };
  return            { key: 'broken',     icon: '⛈️', color: '#DC2626', bg: 'rgba(220,38,38,0.12)',  fill: c };
}
