import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { COURTS, TGM_CENTER, type Court } from '../data/courts';
import { getCourtWeather } from '../lib/courtWeather';
import { useI18n } from '../lib/i18n';

// react-leaflet doesn't ship icons by default; suppress default marker calls.
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: () => string })._getIconUrl;

interface Props {
  courts?: Court[];
  height?: number;
  focusId?: string;
}

export default function CourtMap({ courts = COURTS, height = 420, focusId }: Props) {
  const { t, lang } = useI18n();
  const navigate = useNavigate();

  const focused = focusId ? courts.find((c) => c.id === focusId) : null;
  const center: [number, number] = focused ? [focused.lat, focused.lng] : TGM_CENTER;
  const zoom = focused ? 15 : 13;

  return (
    <div className="court-map" style={{ height }}>
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {courts.map((c) => {
          const w = getCourtWeather(c.condition);
          return (
            <CircleMarker
              key={c.id}
              center={[c.lat, c.lng]}
              radius={10 + c.condition * 6}
              pathOptions={{
                color: w.color,
                fillColor: w.color,
                fillOpacity: 0.5,
                weight: 2,
              }}
              eventHandlers={{ click: () => navigate(`/courts/${c.id}`) }}
            >
              <Popup>
                <strong>{c.name}</strong>
                <br />
                <span style={{ color: w.color }}>{w.icon} {t(`weather.${w.key}`)}</span>
                <br />
                <small>{c.note[lang]}</small>
                <br />
                <button
                  className="popup-btn"
                  onClick={() => navigate(`/courts/${c.id}`)}
                >
                  {t('courts.openDetail')} →
                </button>
              </Popup>
            </CircleMarker>
          );
        })}
        {focused && (
          <Marker position={[focused.lat, focused.lng]}>
            <Popup>{focused.name}</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
