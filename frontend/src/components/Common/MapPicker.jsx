import { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Box, Typography, Button, ButtonGroup, CircularProgress,
  Chip, Tooltip, IconButton,
} from '@mui/material';
import { FiNavigation, FiMap, FiMaximize2, FiCrosshair } from 'react-icons/fi';
import { MdSatellite } from 'react-icons/md';

// Corrige os ícones padrão do Leaflet no Vite (URLs das imagens ficam quebradas sem isso)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
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

const DEFAULT_CENTER = [-20.3155, -40.3128]; // Vitória/ES
const DEFAULT_ZOOM   = 8;

// Componente interno: captura cliques no mapa para mover o marcador
function ClickHandler({ onChange }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Componente interno: movimenta o mapa para coordenadas externas
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

/**
 * MapPicker — componente reutilizável de mapa.
 *
 * Props:
 *   lat, lng          — coordenadas atuais (número ou string)
 *   onChange(lat,lng) — callback ao mover o marcador
 *   addressQuery      — string de endereço para geocodificação automática
 *   readOnly          — apenas visualização (sem marcador arrastável, sem clique)
 *   height            — altura do mapa (default: 320)
 */
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
  const zoom   = hasPos ? 15 : DEFAULT_ZOOM;

  const geocodar = useCallback(async (query) => {
    if (!query?.trim()) return;
    setGeocodando(true);
    setErroGeo('');
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=br`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'pt-BR' } });
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

  const handleGeocodar = () => geocodar(addressQuery);

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
    <Box>
      {/* Barra de controles */}
      {!readOnly && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={geocodando ? <CircularProgress size={14} /> : <FiNavigation size={14} />}
            onClick={handleGeocodar}
            disabled={geocodando || !addressQuery?.trim()}
            title={addressQuery ? `Localizar: "${addressQuery}"` : 'Preencha o município e UF primeiro'}
          >
            {geocodando ? 'Localizando…' : 'Localizar pelo endereço'}
          </Button>

          <ButtonGroup size="small" variant="outlined">
            <Tooltip title="Mapa de ruas">
              <Button
                onClick={() => setCamada('mapa')}
                variant={camada === 'mapa' ? 'contained' : 'outlined'}
                startIcon={<FiMap size={13} />}
              >
                Mapa
              </Button>
            </Tooltip>
            <Tooltip title="Imagem de satélite">
              <Button
                onClick={() => setCamada('satelite')}
                variant={camada === 'satelite' ? 'contained' : 'outlined'}
                startIcon={<MdSatellite size={15} />}
              >
                Satélite
              </Button>
            </Tooltip>
          </ButtonGroup>

          {hasPos && (
            <Chip
              icon={<FiCrosshair size={12} />}
              label={`${parsedLat.toFixed(5)}, ${parsedLng.toFixed(5)}`}
              size="small"
              variant="outlined"
              color="primary"
              onDelete={() => { onChange(null, null); }}
              deleteIcon={<span style={{ fontSize: 14, paddingRight: 4 }}>✕</span>}
            />
          )}
        </Box>
      )}

      {/* Mapa */}
      <Box
        sx={{
          height,
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          position: 'relative',
          cursor: readOnly ? 'default' : 'crosshair',
          '& .leaflet-container': { height: '100%', width: '100%', borderRadius: 'inherit' },
        }}
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

        {/* Link para o Google Maps */}
        {hasPos && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              zIndex: 1000,
            }}
          >
            <Tooltip title="Abrir no Google Maps">
              <IconButton
                size="small"
                component="a"
                href={`https://www.google.com/maps?q=${parsedLat},${parsedLng}`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  bgcolor: 'white',
                  boxShadow: 2,
                  '&:hover': { bgcolor: '#f5f5f5' },
                }}
              >
                <FiMaximize2 size={14} />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>

      {/* Mensagens de ajuda e erro */}
      {!readOnly && !hasPos && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          Clique no mapa para marcar a localização ou use "Localizar pelo endereço".
        </Typography>
      )}
      {erroGeo && (
        <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
          {erroGeo}
        </Typography>
      )}
      {readOnly && hasPos && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          Coordenadas: {parsedLat.toFixed(6)}, {parsedLng.toFixed(6)}
        </Typography>
      )}
    </Box>
  );
}
