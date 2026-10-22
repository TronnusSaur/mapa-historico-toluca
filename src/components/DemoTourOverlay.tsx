import React, { useState, useEffect, useMemo } from 'react';
import { useMap, Polyline, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  X,
  MapPin,
  Ruler,
  Maximize2,
  CheckCircle2,
  Clock,
  Camera,
  FileText,
  Sparkles,
  Minimize2,
  Expand,
  Filter
} from 'lucide-react';
import type { ObraTramo, Obra } from '../types/obras.ts';
import {
  RUTA_DEMOSTRACION_2026,
  PDF_TOTAL_KM,
  PDF_TOTAL_M2,
  resolveObraForDemoStep
} from '../utils/rutaDemostracion2026.ts';
import type { DemoTourStep } from '../utils/rutaDemostracion2026.ts';

interface DemoTourMapControllerProps {
  isActive: boolean;
  activeStep: DemoTourStep | null;
  activeObra: ObraTramo | null;
  onOpenModal?: (obra: Obra) => void;
}

const getMidpoint = (coords: [number, number][]): [number, number] => {
  if (!coords || coords.length === 0) return [19.2827, -99.6557];
  if (coords.length === 1) return coords[0];
  if (coords.length === 2) {
    return [(coords[0][0] + coords[1][0]) / 2, (coords[0][1] + coords[1][1]) / 2];
  }
  const mid = Math.floor(coords.length / 2);
  return coords[mid];
};

export const DemoTourMapController: React.FC<DemoTourMapControllerProps> = ({
  isActive,
  activeStep,
  activeObra,
  onOpenModal
}) => {
  const map = useMap();

  useEffect(() => {
    if (!isActive || !activeObra || !activeObra.coords || activeObra.coords.length === 0) return;

    const coords = activeObra.coords;
    if (coords.length === 1) {
      map.flyTo(coords[0], 17, {
        animate: true,
        duration: 1.15
      });
    } else {
      const bounds = L.latLngBounds(coords.map(c => [c[0], c[1]] as [number, number]));
      map.flyToBounds(bounds, {
        paddingTopLeft: [70, 70],
        paddingBottomRight: [70, 320],
        maxZoom: 17,
        animate: true,
        duration: 1.15
      });
    }
  }, [isActive, activeStep?.stepIndex, activeObra, map]);

  if (!isActive || !activeStep || !activeObra || !activeObra.coords || activeObra.coords.length === 0) {
    return null;
  }

  const midpoint = getMidpoint(activeObra.coords);
  const badgeColor =
    activeStep.bloque === 1 ? '#059669' : activeStep.bloque === 2 ? '#2563eb' : '#dc2626';

  const spotlightIcon = L.divIcon({
    className: 'demo-tour-spotlight-pin',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center;">
        <div style="
          position: absolute;
          width: 48px;
          height: 48px;
          border-radius: 9999px;
          background: rgba(212, 175, 55, 0.38);
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>
        <div style="
          position: relative;
          min-width: 34px;
          height: 34px;
          padding: 0 8px;
          border-radius: 9999px;
          background: linear-gradient(135deg, #7a1531 0%, ${badgeColor} 100%);
          border: 3px solid #d4af37;
          box-shadow: 0 6px 16px rgba(0,0,0,0.45), 0 0 0 3px rgba(255,255,255,0.9);
          color: #ffffff;
          font-weight: 900;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          letter-spacing: -0.3px;
        ">
          #${activeStep.numeroEnBloque}
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });

  return (
    <>
      {activeObra.coords.length >= 2 && (
        <>
          {/* Halo exterior dorado de alto contraste */}
          <Polyline
            positions={activeObra.coords}
            pathOptions={{
              color: '#fbbf24',
              weight: 16,
              opacity: 0.75,
              lineCap: 'round',
              lineJoin: 'round'
            }}
          />
          {/* Halo blanco intermedio */}
          <Polyline
            positions={activeObra.coords}
            pathOptions={{
              color: '#ffffff',
              weight: 11,
              opacity: 0.95,
              lineCap: 'round',
              lineJoin: 'round'
            }}
          />
          {/* Línea central guinda/bloque */}
          <Polyline
            positions={activeObra.coords}
            pathOptions={{
              color: '#7a1531',
              weight: 6,
              opacity: 1,
              lineCap: 'round',
              lineJoin: 'round'
            }}
            eventHandlers={{
              click: () => onOpenModal?.(activeObra)
            }}
          />
        </>
      )}

      <Marker
        position={midpoint}
        icon={spotlightIcon}
        zIndexOffset={2500}
        eventHandlers={{
          click: () => onOpenModal?.(activeObra)
        }}
      >
        <Tooltip permanent direction="top" offset={[0, -20]} className="premium-tooltip">
          <div className="px-2 py-1 font-sans text-center">
            <span className="text-[9px] font-black uppercase tracking-wider text-toluca-burgundy block">
              {activeStep.bloqueNombre} · #{activeStep.numeroEnBloque}
            </span>
            <span className="text-xs font-black text-slate-900 block">
              {activeStep.calle}
            </span>
            <span className="text-[10px] font-semibold text-slate-500 block">
              {activeStep.delegacion} · {activeStep.metrosLineales.toLocaleString('es-MX')} ML
            </span>
          </div>
        </Tooltip>
      </Marker>
    </>
  );
};

interface DemoTourHUDProps {
  isActive: boolean;
  stepIndex: number; // 0-based index in the active list
  onlyWithPhotos: boolean;
  onToggleOnlyWithPhotos: () => void;
  onChangeStepIndex: (newIndex: number) => void;
  onExit: () => void;
  obrasTramos: ObraTramo[];
  onOpenFullModal: (obra: Obra) => void;
  isModalOpen: boolean;
}

type EtapaPreview = 'inicio' | 'proceso' | 'terminado';

export const DemoTourHUD: React.FC<DemoTourHUDProps> = ({
  isActive,
  stepIndex,
  onlyWithPhotos,
  onToggleOnlyWithPhotos,
  onChangeStepIndex,
  onExit,
  obrasTramos,
  onOpenFullModal,
  isModalOpen
}) => {
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [etapaActiva, setEtapaActiva] = useState<EtapaPreview>('terminado');
  const [subFotoIdx, setSubFotoIdx] = useState(0);
  const [imgError, setImgError] = useState(false);
  const [useFallbackUrl, setUseFallbackUrl] = useState(false);

  const stepsList = useMemo(() => {
    if (onlyWithPhotos) {
      return RUTA_DEMOSTRACION_2026.filter(s => s.hasPhotosExpected);
    }
    return RUTA_DEMOSTRACION_2026;
  }, [onlyWithPhotos]);

  const safeIndex = Math.min(Math.max(0, stepIndex), Math.max(0, stepsList.length - 1));
  const currentStep = stepsList[safeIndex] || RUTA_DEMOSTRACION_2026[0];

  const currentObra = useMemo(() => {
    return resolveObraForDemoStep(currentStep, obrasTramos);
  }, [currentStep, obrasTramos]);

  // Extract photo lists
  const isDragon = currentObra.tipo === 'dragon';
  const fotos = currentObra.evidencias?.fotos;
  const fotosFallback = currentObra.evidencias?.fotosFallback;

  const fotosDragon =
    fotos?.fotosDragon ||
    (isDragon && fotos?.proceso && fotos.proceso.length > 0 ? fotos.proceso : []);

  const hasInicio = Boolean(fotos?.inicio || fotosFallback?.inicio);
  const procesoList =
    fotos?.proceso && fotos.proceso.length > 0
      ? fotos.proceso
      : fotosFallback?.proceso || [];
  const fallbackProcesoList = fotosFallback?.proceso || [];
  const hasProceso = procesoList.length > 0;
  const hasTerminado = Boolean(fotos?.terminado || fotosFallback?.terminado);
  const hasAnyPhoto = isDragon ? fotosDragon.length > 0 : hasInicio || hasProceso || hasTerminado;

  const totalPhotosCount = isDragon
    ? fotosDragon.length
    : (hasInicio ? 1 : 0) + procesoList.length + (hasTerminado ? 1 : 0);

  // Reset photo tab when step changes
  useEffect(() => {
    setSubFotoIdx(0);
    setImgError(false);
    setUseFallbackUrl(false);
    if (hasTerminado) {
      setEtapaActiva('terminado');
    } else if (hasProceso) {
      setEtapaActiva('proceso');
    } else {
      setEtapaActiva('inicio');
    }
  }, [currentStep.stepIndex, hasTerminado, hasProceso]);

  // Compute current image URL
  const currentImageUrl = useMemo(() => {
    if (isDragon) {
      if (fotosDragon.length === 0) return null;
      return fotosDragon[subFotoIdx % fotosDragon.length] || fotosDragon[0];
    }
    if (etapaActiva === 'inicio') {
      return useFallbackUrl
        ? fotosFallback?.inicio || fotos?.inicio || null
        : fotos?.inicio || fotosFallback?.inicio || null;
    }
    if (etapaActiva === 'proceso') {
      if (procesoList.length === 0) return null;
      const idx = subFotoIdx % procesoList.length;
      return useFallbackUrl
        ? fallbackProcesoList[idx] || procesoList[idx]
        : procesoList[idx] || fallbackProcesoList[idx];
    }
    if (etapaActiva === 'terminado') {
      return useFallbackUrl
        ? fotosFallback?.terminado || fotos?.terminado || null
        : fotos?.terminado || fotosFallback?.terminado || null;
    }
    return null;
  }, [
    isDragon,
    fotosDragon,
    etapaActiva,
    subFotoIdx,
    useFallbackUrl,
    fotos,
    fotosFallback,
    procesoList,
    fallbackProcesoList
  ]);

  // Auto-play timer
  useEffect(() => {
    if (!isActive || !isAutoPlaying || isModalOpen) return;
    const timer = setInterval(() => {
      onChangeStepIndex((safeIndex + 1) % stepsList.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [isActive, isAutoPlaying, isModalOpen, safeIndex, stepsList.length, onChangeStepIndex]);

  // Keyboard navigation (ESC to exit, Left/Right arrows to navigate)
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Si el modal de pantalla completa está abierto, dejamos que ESC cierre primero el modal o salga
      if (e.key === 'Escape') {
        if (!isModalOpen) {
          e.preventDefault();
          onExit();
        }
        return;
      }

      if (isModalOpen) return;

      // Ignore if typing in an input or select
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setIsAutoPlaying(false);
        onChangeStepIndex((safeIndex + 1) % stepsList.length);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setIsAutoPlaying(false);
        onChangeStepIndex(safeIndex > 0 ? safeIndex - 1 : stepsList.length - 1);
      } else if (e.key === ' ') {
        if (tag !== 'SELECT' && tag !== 'BUTTON') {
          e.preventDefault();
          setIsAutoPlaying(prev => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, isModalOpen, safeIndex, stepsList.length, onChangeStepIndex, onExit]);

  // Accumulated metrics up to current step
  const accumulatedStats = useMemo(() => {
    let ml = 0;
    let m2 = 0;
    for (let i = 0; i <= safeIndex; i++) {
      ml += stepsList[i]?.metrosLineales || 0;
      m2 += stepsList[i]?.superficieM2 || 0;
    }
    return { ml, m2 };
  }, [stepsList, safeIndex]);

  if (!isActive) return null;

  const progressPct = ((safeIndex + 1) / stepsList.length) * 100;

  const jumpToBloque = (bloqueNum: 1 | 2 | 3) => {
    setIsAutoPlaying(false);
    const idx = stepsList.findIndex(s => s.bloque === bloqueNum);
    if (idx !== -1) onChangeStepIndex(idx);
  };

  const renderEstatusBadge = (estatus: string) => {
    if (estatus === 'TERMINADA') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle2 size={11} className="text-emerald-600" />
          TERMINADA
        </span>
      );
    }
    if (estatus === 'EN PROCESO') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-800 border border-blue-300">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
          EN PROCESO
        </span>
      );
    }
    if (estatus.includes('DIABLO')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-100 text-red-800 border border-red-300">
          🔥 DIABLO DRAGÓN
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-900 border border-amber-300">
        <Clock size={11} className="text-amber-700" />
        {estatus}
      </span>
    );
  };

  return (
    <div className="absolute bottom-4 left-4 right-4 z-[1500] pointer-events-none flex flex-col items-center">
      <div className="w-full max-w-6xl bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-toluca-gold/50 overflow-hidden pointer-events-auto transition-all duration-300">
        {/* Barra de progreso superior */}
        <div className="w-full h-1.5 bg-slate-200 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-toluca-burgundy via-red-700 to-toluca-gold transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Header de la Ruta de Demostración */}
        <div className="bg-gradient-to-r from-toluca-burgundy via-[#5e1026] to-slate-900 text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-toluca-gold/20 border border-toluca-gold/50 text-toluca-gold text-[10px] font-black uppercase tracking-wider">
              <Sparkles size={12} />
              Ruta de Demostración · PDF 2026
            </span>

            {/* Pestañas rápidas por Bloque del PDF */}
            <div className="hidden md:flex items-center bg-black/25 p-0.5 rounded-lg border border-white/10 text-[10px] font-bold">
              <button
                onClick={() => jumpToBloque(1)}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  currentStep.bloque === 1
                    ? 'bg-emerald-600 text-white font-black shadow-xs'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                1. Pavimentación (19)
              </button>
              <button
                onClick={() => jumpToBloque(2)}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  currentStep.bloque === 2
                    ? 'bg-blue-600 text-white font-black shadow-xs'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                2. Rehabilitación (39)
              </button>
              <button
                onClick={() => jumpToBloque(3)}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  currentStep.bloque === 3
                    ? 'bg-red-600 text-white font-black shadow-xs'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                3. Diablo Dragón (10)
              </button>
            </div>
          </div>

          {/* Controles derechos del Header: Filtro Con Fotos, Selector directo, Minimizar y Salir (ESC) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsAutoPlaying(false);
                onToggleOnlyWithPhotos();
              }}
              className={`px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wide flex items-center gap-1.5 transition-all cursor-pointer ${
                onlyWithPhotos
                  ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200'
                  : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20'
              }`}
              title="Alternar entre todas las 68 obras del PDF o solo las 56 obras con evidencia fotográfica"
            >
              <Filter size={11} />
              {onlyWithPhotos ? 'Solo con foto (56)' : 'Todas PDF (68)'}
            </button>

            {/* Selector rápido de obra */}
            <select
              value={safeIndex}
              onChange={(e) => {
                setIsAutoPlaying(false);
                onChangeStepIndex(Number(e.target.value));
              }}
              aria-label="Seleccionar obra del recorrido"
              className="bg-slate-800/90 text-white border border-white/20 rounded-lg px-2.5 py-1 text-[11px] font-bold max-w-[210px] sm:max-w-[260px] truncate focus:outline-none focus:ring-2 focus:ring-toluca-gold cursor-pointer"
            >
              {[1, 2, 3].map(blq => {
                const groupItems = stepsList
                  .map((s, idx) => ({ s, idx }))
                  .filter(item => item.s.bloque === blq);
                if (groupItems.length === 0) return null;
                const label =
                  blq === 1
                    ? 'Bloque 1: Pavimentación y Concretos'
                    : blq === 2
                    ? 'Bloque 2: Rehabilitación de Pavimento'
                    : 'Bloque 3: Diablo Dragón';
                return (
                  <optgroup key={blq} label={label} className="bg-slate-900 text-toluca-gold">
                    {groupItems.map(({ s, idx }) => (
                      <option key={s.stepIndex} value={idx} className="bg-slate-900 text-white">
                        #{s.numeroEnBloque} - {s.calle} ({s.delegacion}) {s.hasPhotosExpected ? '📷' : '📋'}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>

            <button
              onClick={() => setIsCollapsed(prev => !prev)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title={isCollapsed ? 'Expandir panel' : 'Minimizar panel para ver más mapa'}
            >
              {isCollapsed ? <Expand size={14} /> : <Minimize2 size={14} />}
            </button>

            <button
              onClick={onExit}
              className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-black text-[11px] tracking-wider uppercase flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              title="Salir de la ruta de demostración (Tecla ESC)"
            >
              <X size={14} />
              <span>Salir (ESC)</span>
            </button>
          </div>
        </div>

        {/* Cuerpo Principal (Colapsable) */}
        {!isCollapsed && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 sm:p-5 bg-gradient-to-b from-white to-slate-50/90">
            {/* COLUMNA IZQUIERDA (7 cols): Ficha Técnica Oficial del PDF */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-3">
              <div>
                {/* Badges de clasificación */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-toluca-burgundy text-white text-[10px] font-black uppercase tracking-wider">
                    {currentStep.bloqueNombre} · #{currentStep.numeroEnBloque} de {currentStep.totalEnBloque}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-200 text-slate-800 text-[10px] font-extrabold uppercase">
                    {currentStep.tipoObraPdf}
                  </span>
                  {renderEstatusBadge(currentStep.estatusPdf)}
                  {currentStep.contratoKey && (
                    <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-300 text-[10px] font-mono font-bold">
                      {currentStep.contratoKey}
                    </span>
                  )}
                </div>

                {/* Título de Vialidad y Delegación */}
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug">
                    Calle {currentStep.calle}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-xs font-extrabold text-toluca-burgundy">
                    <MapPin size={13} className="text-toluca-gold shrink-0" />
                    Delegación {currentStep.delegacion}
                  </span>
                </div>

                {/* Descripción íntegra del PDF */}
                <div className="mt-2 p-2.5 rounded-xl bg-slate-100/80 border border-slate-200/80">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">
                    Descripción Oficial en Tabla 1 del PDF
                  </span>
                  <p className="text-xs font-medium text-slate-700 leading-relaxed line-clamp-2 sm:line-clamp-3">
                    "{currentStep.descripcionPdf}"
                  </p>
                </div>
              </div>

              {/* Tarjetas de Métricas del PDF */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">
                    Metros Lineales
                  </span>
                  <span className="text-base font-black text-slate-900 flex items-center gap-1 mt-0.5">
                    <Ruler size={14} className="text-blue-600 shrink-0" />
                    {currentStep.metrosLineales.toLocaleString('es-MX')} <small className="text-[10px] font-bold text-slate-500">ML</small>
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">
                    Superficie PDF
                  </span>
                  <span className="text-base font-black text-toluca-burgundy flex items-center gap-1 mt-0.5">
                    <Maximize2 size={14} className="text-toluca-gold shrink-0" />
                    {currentStep.superficieM2 > 0
                      ? `${currentStep.superficieM2.toLocaleString('es-MX')}`
                      : 'En Proy.'}{' '}
                    {currentStep.superficieM2 > 0 && (
                      <small className="text-[10px] font-bold text-slate-500">m²</small>
                    )}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 text-white shadow-2xs">
                  <span className="text-[9px] font-bold text-toluca-gold uppercase block">
                    Acumulado Ruta
                  </span>
                  <span className="text-sm font-black text-white block mt-0.5">
                    {(accumulatedStats.ml / 1000).toFixed(2)} <small className="text-[10px] text-slate-300">/ {PDF_TOTAL_KM} km</small>
                  </span>
                  <span className="text-[9px] text-slate-400 block">
                    {Math.round(accumulatedStats.m2).toLocaleString('es-MX')} / {PDF_TOTAL_M2.toLocaleString('es-MX')} m²
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">
                    Expediente Completo
                  </span>
                  <button
                    onClick={() => onOpenFullModal(currentObra)}
                    className="mt-1 w-full py-1 px-2 rounded-lg bg-toluca-burgundy/10 hover:bg-toluca-burgundy hover:text-white text-toluca-burgundy font-black text-[10px] uppercase tracking-wide flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Expand size={11} />
                    <span>Abrir Modal ({totalPhotosCount})</span>
                  </button>
                </div>
              </div>
            </div>

            {/* COLUMNA DERECHA (5 cols): Visor Fotográfico Integrado */}
            <div className="lg:col-span-5 flex flex-col">
              {hasAnyPhoto ? (
                <div className="flex-1 flex flex-col rounded-xl border border-slate-200 bg-slate-950 overflow-hidden shadow-inner">
                  {/* Selector de Etapa de Foto */}
                  <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800">
                    {isDragon ? (
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                          <Camera size={12} />
                          Carrusel Diablo Dragón ({ (subFotoIdx % fotosDragon.length) + 1 } / {fotosDragon.length})
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              setSubFotoIdx(prev => (prev > 0 ? prev - 1 : fotosDragon.length - 1))
                            }
                            className="p-1 rounded bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                          >
                            <ChevronLeft size={13} />
                          </button>
                          <button
                            onClick={() =>
                              setSubFotoIdx(prev => (prev + 1) % fotosDragon.length)
                            }
                            className="p-1 rounded bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                          >
                            <ChevronRight size={13} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full gap-1">
                        <div className="flex items-center gap-1">
                          <button
                            disabled={!hasInicio}
                            onClick={() => {
                              setEtapaActiva('inicio');
                              setSubFotoIdx(0);
                              setUseFallbackUrl(false);
                              setImgError(false);
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase transition-all cursor-pointer ${
                              etapaActiva === 'inicio'
                                ? 'bg-amber-500 text-slate-950'
                                : hasInicio
                                ? 'bg-white/10 text-white/80 hover:bg-white/20'
                                : 'opacity-30 text-white/40 cursor-not-allowed'
                            }`}
                          >
                            Inicio
                          </button>
                          <button
                            disabled={!hasProceso}
                            onClick={() => {
                              setEtapaActiva('proceso');
                              setSubFotoIdx(0);
                              setUseFallbackUrl(false);
                              setImgError(false);
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase transition-all cursor-pointer ${
                              etapaActiva === 'proceso'
                                ? 'bg-blue-500 text-white'
                                : hasProceso
                                ? 'bg-white/10 text-white/80 hover:bg-white/20'
                                : 'opacity-30 text-white/40 cursor-not-allowed'
                            }`}
                          >
                            Proceso ({procesoList.length})
                          </button>
                          <button
                            disabled={!hasTerminado}
                            onClick={() => {
                              setEtapaActiva('terminado');
                              setSubFotoIdx(0);
                              setUseFallbackUrl(false);
                              setImgError(false);
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase transition-all cursor-pointer ${
                              etapaActiva === 'terminado'
                                ? 'bg-emerald-500 text-slate-950'
                                : hasTerminado
                                ? 'bg-white/10 text-white/80 hover:bg-white/20'
                                : 'opacity-30 text-white/40 cursor-not-allowed'
                            }`}
                          >
                            Terminado
                          </button>
                        </div>

                        {etapaActiva === 'proceso' && procesoList.length > 1 && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() =>
                                setSubFotoIdx(prev =>
                                  prev > 0 ? prev - 1 : procesoList.length - 1
                                )
                              }
                              className="p-0.5 rounded bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                              title="Foto de proceso anterior"
                            >
                              <ChevronLeft size={12} />
                            </button>
                            <span className="text-[10px] font-bold text-white/80">
                              {(subFotoIdx % procesoList.length) + 1}/{procesoList.length}
                            </span>
                            <button
                              onClick={() =>
                                setSubFotoIdx(prev => (prev + 1) % procesoList.length)
                              }
                              className="p-0.5 rounded bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                              title="Siguiente foto de proceso"
                            >
                              <ChevronRight size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Contenedor de Imagen */}
                  <div
                    onClick={() => onOpenFullModal(currentObra)}
                    className="relative h-44 sm:h-48 w-full flex items-center justify-center bg-slate-950 cursor-pointer group overflow-hidden"
                    title="Haz clic para ampliar fotografía en pantalla completa"
                  >
                    {currentImageUrl && !imgError ? (
                      <>
                        <img
                          src={currentImageUrl}
                          alt={`${currentStep.calle} - ${etapaActiva}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={() => {
                            if (!useFallbackUrl) {
                              setUseFallbackUrl(true);
                            } else {
                              setImgError(true);
                            }
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2.5">
                          <span className="text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 rounded">
                            Clic para pantalla completa
                          </span>
                          <Expand size={14} className="text-white" />
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-4 text-slate-400">
                        <Camera size={24} className="mx-auto mb-1 opacity-50" />
                        <p className="text-xs font-bold">Vista previa no disponible</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/70 p-4 flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 mb-2">
                    <FileText size={20} />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-950 text-[10px] font-black uppercase tracking-wide mb-1">
                    {currentStep.estatusPdf}
                  </span>
                  <h4 className="text-xs font-black text-slate-800">
                    Obra en Fase Administrativa / Planeación
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-1 max-w-xs leading-relaxed">
                    Esta obra forma parte de la Tabla 1 del PDF 2026 bajo estatus{' '}
                    <b>{currentStep.estatusPdf}</b>, por lo que aún no registra fotografías de ejecución física en campo.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer de Controles de Navegación Paso a Paso */}
        <div className="bg-slate-100 border-t border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-toluca-burgundy">
              Obra {safeIndex + 1} de {stepsList.length}
            </span>
            <span className="hidden sm:inline text-[11px] text-slate-500 font-medium">
              · Usa las flechas <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-bold">←</kbd>{' '}
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-bold">→</kbd> para avanzar o{' '}
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-bold">ESC</kbd> para salir
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsAutoPlaying(false);
                onChangeStepIndex(safeIndex > 0 ? safeIndex - 1 : stepsList.length - 1);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-black text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            >
              <ChevronLeft size={15} />
              <span>Anterior</span>
            </button>

            <button
              onClick={() => setIsAutoPlaying(prev => !prev)}
              className={`px-3.5 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 border transition-all cursor-pointer ${
                isAutoPlaying
                  ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-md'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
              }`}
              title="Avanzar automáticamente cada 6.5 segundos"
            >
              {isAutoPlaying ? <Pause size={14} /> : <Play size={14} />}
              <span>{isAutoPlaying ? 'Pausar Auto-Tour' : 'Auto-Tour'}</span>
            </button>

            <button
              onClick={() => {
                setIsAutoPlaying(false);
                onChangeStepIndex((safeIndex + 1) % stepsList.length);
              }}
              className="px-4 py-1.5 rounded-xl bg-toluca-burgundy hover:bg-[#5e1026] text-white font-black text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <span>Siguiente Obra</span>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
