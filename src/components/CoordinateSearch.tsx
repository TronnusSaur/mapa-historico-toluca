import { useState, useEffect, useRef, useMemo } from 'react';
import { useMap, CircleMarker, Popup } from 'react-leaflet';
import { Search, X, MapPin, Landmark, Navigation, Loader2 } from 'lucide-react';
import type { PotholeData } from '../utils/dataProcessors.ts';

interface FilterState {
  showHistorico: boolean;
  showTramos: boolean;
  showGeoJSON: boolean;
  showPlaneado: boolean;
  showE1: boolean;
  showE2: boolean;
  showE3: boolean;
  showPavimentaciones: boolean;
  renderMode: 'tramos' | 'clusters';
}

interface Props {
  data: PotholeData[];
  geoData: {
    features?: Array<{
      properties?: {
        NOMDEL?: string;
        UTB_COUNT?: string | number;
      };
      bbox?: [number, number, number, number];
    }>;
  } | null;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

interface Suggestion {
  type: 'coordinate' | 'delegation' | 'street' | 'geocoding';
  name: string;
  lat: number;
  lng: number;
  details?: string;
}

interface GeocodedResult {
  name: string;
  lat: number;
  lng: number;
}

interface NominatimItem {
  display_name: string;
  lat: string;
  lon: string;
}

/**
 * Robustly parses coordinates for Toluca.
 * Finds two numbers, maps them to lat/lng and ensures lng is negative.
 */
function parseCoordinates(query: string): [number, number] | null {
  if (!query) return null;
  // Match numbers including decimals and signs
  const matches = query.match(/[-+]?[0-9]*\.?[0-9]+/g);
  if (matches && matches.length >= 2) {
    const num1 = parseFloat(matches[0]);
    const num2 = parseFloat(matches[1]);
    
    let lat = NaN;
    let lng = NaN;
    
    // Classify based on expected ranges for Toluca:
    // Latitude is positive ~19.x, Longitude is negative ~-99.x
    if (Math.abs(num1) >= 98.0 && Math.abs(num1) <= 101.5 && Math.abs(num2) >= 18.0 && Math.abs(num2) <= 20.0) {
      lng = num1;
      lat = num2;
    } else if (Math.abs(num2) >= 98.0 && Math.abs(num2) <= 101.5 && Math.abs(num1) >= 18.0 && Math.abs(num1) <= 20.0) {
      lat = num1;
      lng = num2;
    } else {
      // Fallback: first lat, second lng
      lat = num1;
      lng = num2;
    }
    
    // Autocorrect positive longitude if user forgot the minus sign
    if (lng > 0) {
      lng = -lng;
    }
    
    // Check if coordinates are in a wide bounding box enclosing Toluca & Estado de México
    if (!isNaN(lat) && !isNaN(lng) && lat >= 18.5 && lat <= 20.0 && lng >= -101.0 && lng <= -98.0) {
      return [lat, lng];
    }
  }
  return null;
}

export default function CoordinateSearch({ data, geoData, setFilters }: Props) {
  const map = useMap();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [geocodedResults, setGeocodedResults] = useState<GeocodedResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchMarker, setSearchMarker] = useState<[number, number] | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Click outside listener to collapse if empty
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (query.trim() === '') {
          setIsOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [query]);

  // Extract unique local delegations
  const localDelegations = useMemo(() => {
    if (!geoData || !geoData.features) return [];
    return geoData.features.map((f) => {
      const name = f.properties?.NOMDEL || '';
      let center: [number, number] = [19.2827, -99.6557];
      if (f.bbox) {
        center = [(f.bbox[1] + f.bbox[3]) / 2, (f.bbox[0] + f.bbox[2]) / 2];
      }
      return { name, center };
    }).filter((d) => d.name !== '');
  }, [geoData]);

  // Extract unique streets from database and ticket data (pre-cached)
  const localStreets = useMemo(() => {
    if (!data) return [];
    const streetsMap = new Map<string, { street: string; delegation: string; lat: number; lng: number }>();
    data.forEach(p => {
      if (p.street && p.lat && p.lng) {
        const key = `${p.street.trim().toLowerCase()} - ${p.delegation.trim().toLowerCase()}`;
        if (!streetsMap.has(key)) {
          streetsMap.set(key, {
            street: p.street.trim(),
            delegation: p.delegation.trim(),
            lat: p.lat,
            lng: p.lng
          });
        }
      }
    });
    return Array.from(streetsMap.values());
  }, [data]);

  // Debounced geocoding via Nominatim
  useEffect(() => {
    const q = query.trim();
    if (q.length < 3 || parseCoordinates(q)) {
      setGeocodedResults([]);
      return;
    }

    setIsLoading(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q + ', Toluca')}&viewbox=-100.0,19.0,-99.3,19.5&bounded=1&limit=5`;
        const res = await fetch(url, {
          headers: {
            'Accept-Language': 'es'
          }
        });
        const resData = await res.json();
        if (resData && Array.isArray(resData)) {
          const results = resData.map((item: NominatimItem) => ({
            name: item.display_name.split(',')[0] + (item.display_name.split(',')[1] ? ', ' + item.display_name.split(',')[1] : ''),
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon)
          }));
          setGeocodedResults(results);
        }
      } catch (err) {
        console.error("Geocoding error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 600);

    return () => {
      clearTimeout(delayDebounce);
      setIsLoading(false);
    };
  }, [query]);

  // Filter and assemble suggestions list
  const suggestions = useMemo(() => {
    const list: Suggestion[] = [];
    const q = query.trim().toLowerCase();
    if (q.length < 2) return list;

    // 1. Direct coordinate match
    const parsedCoords = parseCoordinates(query);
    if (parsedCoords) {
      list.push({
        type: 'coordinate',
        name: `Ir a Coordenadas: ${parsedCoords[0].toFixed(5)}, ${parsedCoords[1].toFixed(5)}`,
        lat: parsedCoords[0],
        lng: parsedCoords[1],
        details: 'Coordenadas detectadas'
      });
    }

    // 2. Delegations
    const matchedDels = localDelegations
      .filter((d) => d.name.toLowerCase().includes(q))
      .slice(0, 3);
    matchedDels.forEach((d) => {
      list.push({
        type: 'delegation',
        name: d.name,
        lat: d.center[0],
        lng: d.center[1],
        details: 'Delegación Territorial'
      });
    });

    // 3. Streets
    if (q.length >= 3) {
      const matchedStreets = localStreets
        .filter((s) => s.street.toLowerCase().includes(q))
        .slice(0, 4);
      matchedStreets.forEach((s) => {
        list.push({
          type: 'street',
          name: s.street,
          lat: s.lat,
          lng: s.lng,
          details: s.delegation ? `Calle · ${s.delegation}` : 'Calle'
        });
      });
    }

    // 4. Geocoding items
    geocodedResults.forEach((item) => {
      // Avoid duplication
      const exists = list.some(existing => 
        Math.abs(existing.lat - item.lat) < 0.0001 && 
        Math.abs(existing.lng - item.lng) < 0.0001
      );
      if (!exists) {
        list.push({
          type: 'geocoding',
          name: item.name,
          lat: item.lat,
          lng: item.lng,
          details: 'Ubicación'
        });
      }
    });

    return list;
  }, [query, localDelegations, localStreets, geocodedResults]);

  const selectItem = (item: Suggestion) => {
    // Zoom and pan
    map.flyTo([item.lat, item.lng], 17, { duration: 1.5 });
    
    // Switch to point cloud view (clusters)
    setFilters((prev) => ({
      ...prev,
      renderMode: 'clusters'
    }));
    
    // Drop marker
    setSearchMarker([item.lat, item.lng]);
    
    // Clear and fill search text
    setQuery(item.name);
    setGeocodedResults([]);
  };

  const handleClearOrClose = () => {
    if (query !== '') {
      setQuery('');
      setGeocodedResults([]);
    } else {
      setIsOpen(false);
    }
  };

  const getIcon = (type: Suggestion['type']) => {
    switch (type) {
      case 'coordinate':
        return <MapPin className="w-4 h-4 text-amber-500" />;
      case 'delegation':
        return <Landmark className="w-4 h-4 text-toluca-burgundy" />;
      case 'street':
        return <Navigation className="w-4 h-4 text-emerald-600" />;
      default:
        return <MapPin className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <>
      <div 
        ref={containerRef}
        className="absolute top-4 right-4 z-[1000] flex flex-col items-end w-[350px] sm:w-[400px] pointer-events-none"
      >
        <div 
          className={`h-12 bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-lg transition-all duration-300 ease-in-out flex items-center overflow-hidden pointer-events-auto ${
            isOpen 
              ? 'w-full rounded-2xl px-3 gap-2' 
              : 'w-12 rounded-full justify-center cursor-pointer hover:scale-105 hover:bg-white'
          }`}
          onClick={() => {
            if (!isOpen) setIsOpen(true);
          }}
        >
          {isOpen ? (
            <>
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar coordenadas, delegaciones o calles..."
                className="w-full bg-transparent border-none outline-none text-sm font-semibold text-slate-800 placeholder-slate-400 py-1"
              />
              {isLoading ? (
                <Loader2 className="w-4 h-4 text-slate-400 animate-spin shrink-0" />
              ) : (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearOrClose();
                  }}
                  className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </>
          ) : (
            <Search className="w-5 h-5 text-toluca-burgundy" />
          )}
        </div>

        {/* Dropdown Suggestions */}
        {isOpen && suggestions.length > 0 && (
          <div className="w-full bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-xl overflow-hidden mt-1 max-h-60 overflow-y-auto flex flex-col pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-200">
            {suggestions.map((item, idx) => (
              <button
                key={idx}
                onClick={() => selectItem(item)}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-100/80 transition-colors border-b border-slate-100 last:border-0 text-left"
              >
                <div className="shrink-0 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                  {getIcon(item.type)}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-slate-800 truncate">{item.name}</span>
                  {item.details && (
                    <span className="text-[10px] font-bold text-slate-400 tracking-wide uppercase mt-0.5">{item.details}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Temporary highlight marker for search results */}
      {searchMarker && (
        <CircleMarker
          center={searchMarker}
          radius={12}
          fillColor="#d4af37"
          color="#7a1531"
          weight={3}
          fillOpacity={0.65}
          className="search-highlight-marker"
        >
          <Popup onClose={() => setSearchMarker(null)}>
            <div className="font-sans min-w-[150px] p-1">
              <div className="border-b border-slate-100 pb-1.5 mb-1.5">
                <span className="text-[9px] font-extrabold tracking-widest text-toluca-gold uppercase">Ubicación Buscada</span>
                <h4 className="text-xs font-black text-slate-800 mt-0.5">Destino Seleccionado</h4>
              </div>
              <div className="text-[10px] font-medium text-slate-500 space-y-1">
                <div><b>Lat:</b> {searchMarker[0].toFixed(6)}</div>
                <div><b>Lng:</b> {searchMarker[1].toFixed(6)}</div>
              </div>
            </div>
          </Popup>
        </CircleMarker>
      )}
    </>
  );
}
