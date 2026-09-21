import { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { FiNavigation, FiMap, FiMaximize2, FiCrosshair } from 'react-icons/fi';
import { MdSatellite } from 'react-icons/md';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import Tooltip from '../ui/Tooltip';
import Button from '../ui/Button';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const TILES = {
  mapa: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
    maxZoom: 19,
  },
  satelite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '© <a href="https://www.esri.com">Esri</a>',
    maxZoom: 18,
  },
};

const DEFAULT_CENTER = [-20.3155, -40.3128];
const DEFAULT_ZOOM = 8;

function ClickHandler({ onChange }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapMover({ lat, lng, shouldFly }) {
  const map = useMap();
  const prevRef = useRef(null);
  useEffect(() => {
    if (!lat || !lng) return;
    const key = `${lat},${lng}`;
    if (prevRef.current === key) return;
    prevRef.current = key;
    if (shouldFly) {
      map.flyTo([lat, lng], Math.max(map.getZoom(), 14), { duration: 1.2 });
    }
  }, [lat, lng, shouldFly, map]);
  return null;
}

export default function MapPicker({ lat, lng, onChange, addressQuery, readOnly = false, height = 320 }) {
  const [camada, setCamada] = useState('mapa');
  const [geocodando, setGeocodando] = useState(false);
  const [erroGeo, setErroGeo] = useState('');
  const [shouldFly, setShouldFly] = useState(false);
  const tile = TILES[camada];

  const hasPos = lat != null && lng != null && lat !== '' && lng !== '';
  const parsedLat = hasPos ? parseFloat(lat) : null;
  const parsedLng = hasPos ? parseFloat(lng) : null;

  const center = hasPos ? [parsedLat, parsedLng] : DEFAULT_CENTER;
  const zoom = hasPos ? 15 : DEFAULT_ZOOM;

  const ultimaBuscaRef = useRef(0);
  const GEOCODAR_INTERVALO_MIN_MS = 1000;

  const geocodar = useCallback(async (query) => {
    if (!query?.trim()) return;
    const agora = Date.now();
    if (agora - ultimaBuscaRef.current < GEOCODAR_INTERVALO_MIN_MS) {
      setErroGeo('Aguarde um instante antes de buscar novamente.');
      return;
    }
    ultimaBuscaRef.current = agora;
    setGeocodando(true);
    setErroGeo('');
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=br`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'pt-BR' } });
      if (!res.ok) {
        setErroGeo(res.status === 429
          ? 'Muitas buscas em pouco tempo. Aguarde alguns segundos.'
          : 'Falha ao buscar endereço. Tente novamente.');
        return;
      }
      const data = await res.json();
      if (!data.length) {
        setErroGeo('Endereço não encontrado. Tente um nome mais preciso.');
        return;
      }
      const { lat: gLat, lon: gLng } = data[0];
      setShouldFly(true);
      onChange(parseFloat(gLat), parseFloat(gLng));
    } catch {
      setErroGeo('Falha ao buscar endereço. Verifique a conexão.');
    } finally {
      setGeocodando(false);
    }
  }, [onChange]);

  const handleMarkerDrag = useCallback((e) => {
    const { lat: mLat, lng: mLng } = e.target.getLatLng();
    setShouldFly(false);
    onChange(parseFloat(mLat.toFixed(7)), parseFloat(mLng.toFixed(7)));
  }, [onChange]);

  const handleClick = useCallback((clat, clng) => {
    if (readOnly) return;
    setShouldFly(false);
    onChange(parseFloat(clat.toFixed(7)), parseFloat(clng.toFixed(7)));
  }, [onChange, readOnly]);

  return (
    <div>
      {/* Barra de controles */}
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<FiNavigation size={13} />}
            loading={geocodando}
            disabled={geocodando || !addressQuery?.trim()}
            onClick={() => geocodar(addressQuery)}
          >
            {geocodando ? 'Localizando…' : 'Localizar pelo endereço'}
          </Button>

          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
            <button
              type="button"
              onClick={() => setCamada('mapa')}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                camada === 'mapa' ? 'bg-white text-caparao-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FiMap size={13} />
              Mapa
            </button>
            <button
              type="button"
              onClick={() => setCamada('satelite')}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                camada === 'satelite' ? 'bg-white text-caparao-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MdSatellite size={14} />
              Satélite
            </button>
          </div>

          {hasPos && (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-caparao-200 bg-caparao-50 px-2.5 py-1 text-xs font-semibold text-caparao-800">
              <FiCrosshair size={12} />
              <span>{parsedLat.toFixed(5)}, {parsedLng.toFixed(5)}</span>
              <button
                type="button"
                onClick={() => onChange(null, null)}
                className="ml-1 text-slate-400 hover:text-slate-700"
                aria-label="Limpar coordenadas"
              >
                ✕
              </button>
            </span>
          )}
        </div>
      )}

      {/* Container do Mapa */}
      <div
        className="relative overflow-hidden rounded-xl border border-slate-200 shadow-xs"
        style={{ height, cursor: readOnly ? 'default' : 'crosshair' }}
      >
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom
          zoomControl
        >
          <TileLayer
            key={camada}
            url={tile.url}
            attribution={tile.attribution}
            maxZoom={tile.maxZoom}
          />

          {!readOnly && <ClickHandler onChange={handleClick} />}
          <MapMover lat={parsedLat} lng={parsedLng} shouldFly={shouldFly} />

          {hasPos && (
            <Marker
              position={[parsedLat, parsedLng]}
              draggable={!readOnly}
              eventHandlers={readOnly ? {} : { dragend: handleMarkerDrag }}
            />
          )}
        </MapContainer>

        {hasPos && (
          <div className="absolute bottom-3 right-3 z-1000">
            <Tooltip content="Abrir no Google Maps">
              <a
                href={`https://www.google.com/maps?q=${parsedLat},${parsedLng}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Abrir localização no Google Maps"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-700 shadow-md hover:bg-slate-50 transition-colors"
              >
                <FiMaximize2 size={14} />
              </a>
            </Tooltip>
          </div>
        )}
      </div>

      {!readOnly && !hasPos && (
        <p className="mt-1 text-xs text-slate-500">
          Clique no mapa para marcar a localização ou use "Localizar pelo endereço".
        </p>
      )}
      {erroGeo && (
        <p className="mt-1 text-xs text-red-600 font-medium">
          {erroGeo}
        </p>
      )}
      {readOnly && hasPos && (
        <p className="mt-1 text-xs text-slate-500">
          Coordenadas: {parsedLat.toFixed(6)}, {parsedLng.toFixed(6)}
        </p>
      )}
    </div>
  );
}
