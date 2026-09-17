import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Ruler, 
  Maximize2, 
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import type { Obra, EstadoTemporalObra } from '../types/obras.ts';

interface ObraDetailModalProps {
  obra: Obra | null;
  onClose: () => void;
}

type EtapaFoto = 'inicio' | 'proceso' | 'terminado';

export const ObraDetailModal: React.FC<ObraDetailModalProps> = ({ obra, onClose }) => {
  const [etapaActiva, setEtapaActiva] = useState<EtapaFoto>('inicio');
  const [procesoIndex, setProcesoIndex] = useState<number>(0);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [imgLoaded, setImgLoaded] = useState<boolean>(false);
  const [imgError, setImgError] = useState<boolean>(false);
  const [triedFallback, setTriedFallback] = useState<boolean>(false);
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);

  const fotos = obra?.evidencias?.fotos;
  const fotosFallback = obra?.evidencias?.fotosFallback;

  const fotoInicio = fotos?.inicio || null;
  const fotosProceso = (fotos?.proceso && fotos.proceso.length > 0) ? fotos.proceso : [];
  const fotoTerminado = fotos?.terminado || null;

  const fallbackInicio = fotosFallback?.inicio || null;
  const fallbackProceso = (fotosFallback?.proceso && fotosFallback.proceso.length > 0) ? fotosFallback.proceso : [];
  const fallbackTerminado = fotosFallback?.terminado || null;

  const hasInicio = Boolean(fotoInicio || fallbackInicio);
  const hasProceso = Boolean(fotosProceso.length > 0 || fallbackProceso.length > 0);
  const hasTerminado = Boolean(fotoTerminado || fallbackTerminado);

  const totalProceso = Math.max(fotosProceso.length, fallbackProceso.length);

  // Determinar la etapa inicial preferida según las fotos disponibles
  useEffect(() => {
    if (!obra) return;
    if (hasTerminado) {
      setEtapaActiva('terminado');
    } else if (hasProceso) {
      setEtapaActiva('proceso');
      setProcesoIndex(0);
    } else if (hasInicio) {
      setEtapaActiva('inicio');
    } else {
      setEtapaActiva('inicio');
    }
    setIsZoomed(false);
  }, [obra]);

  // Actualizar la URL de la imagen actual
  let primaryUrl: string | null = null;
  let fallbackUrl: string | null = null;

  if (etapaActiva === 'inicio') {
    primaryUrl = fotoInicio;
    fallbackUrl = fallbackInicio;
  } else if (etapaActiva === 'proceso') {
    primaryUrl = fotosProceso.length > 0 ? (fotosProceso[procesoIndex] || fotosProceso[0]) : null;
    fallbackUrl = fallbackProceso.length > 0 ? (fallbackProceso[procesoIndex] || fallbackProceso[0]) : null;
  } else if (etapaActiva === 'terminado') {
    primaryUrl = fotoTerminado;
    fallbackUrl = fallbackTerminado;
  }

  useEffect(() => {
    const initialUrl = primaryUrl || fallbackUrl;
    setCurrentSrc(initialUrl);
    setTriedFallback(false);
    setImgLoaded(false);
    setImgError(false);
  }, [primaryUrl, fallbackUrl]);

  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isZoomed) {
          setIsZoomed(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZoomed, onClose]);

  if (!obra) return null;

  // Estado temporal de la obra
  const getTimelineStatus = (): EstadoTemporalObra => {
    const now = new Date();
    if (obra.fechaInicio && now < obra.fechaInicio) return 'POR_INICIAR';
    if (obra.fechaFin && now > obra.fechaFin) return 'CONCLUIDA';
    return 'EN_EJECUCION';
  };

  const status = getTimelineStatus();

  const renderStatusBadge = () => {
    if (status === 'CONCLUIDA') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide bg-blue-50 text-blue-700 border border-blue-200 shadow-sm">
          <CheckCircle2 size={12} className="text-blue-600" />
          CONCLUIDA
        </span>
      );
    }
    if (status === 'EN_EJECUCION') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping mr-0.5" />
          EN EJECUCIÓN
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide bg-amber-50 text-amber-700 border border-amber-200 shadow-sm">
        <Clock size={12} className="text-amber-600" />
        POR INICIAR
      </span>
    );
  };

  const formatDate = (date?: Date | null) => {
    if (!date) return 'Sin fecha';
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handlePrevProceso = () => {
    if (totalProceso <= 1) return;
    setProcesoIndex((prev) => (prev > 0 ? prev - 1 : totalProceso - 1));
  };

  const handleNextProceso = () => {
    if (totalProceso <= 1) return;
    setProcesoIndex((prev) => (prev < totalProceso - 1 ? prev + 1 : 0));
  };

  return (
    <div 
      className="fixed inset-0 z-[3000] flex items-center justify-center p-3 sm:p-5 md:p-8 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra superior de encabezado */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-toluca-burgundy" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Detalle y Evidencias de Obra Pública 2026
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors focus:outline-none"
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Cuerpo del Modal: 2 Columnas con espaciado equilibrado */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-y-auto">
          
          {/* COLUMNA IZQUIERDA: INFORMACIÓN DE CONTRATO Y OBRA (5 columnas lg) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div>
              {/* 1. Número de Contrato (Tipografía afinada) */}
              <div className="mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                  Número de Contrato
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight break-words font-mono">
                  {obra.contrato || obra.evidencias?.noContrato || 'S/N'}
                </h2>
              </div>

              {/* 2. Badges: idContrato y Estado */}
              <div className="flex flex-wrap items-center gap-1.5 my-2.5">
                {obra.idContrato ? (
                  <span className="px-2.5 py-0.5 bg-toluca-burgundy text-white rounded-full text-[11px] font-black tracking-wider uppercase shadow-sm">
                    {obra.idContrato}
                  </span>
                ) : null}
                {renderStatusBadge()}
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[11px] font-semibold uppercase">
                  {obra.tipo.toUpperCase()}{obra.subtipo ? ` · ${obra.subtipo}` : ''}
                </span>
              </div>

              {/* 3. Nombre / Descripción Completa de la Obra */}
              <div className="mt-3 p-3.5 rounded-xl bg-slate-50/80 border border-slate-100">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                  Descripción Oficial de la Obra
                </span>
                <p className="text-xs sm:text-[13px] font-medium text-slate-700 leading-relaxed">
                  "{obra.nombre || obra.evidencias?.nombreObra || 'Sin descripción disponible'}"
                </p>
              </div>
            </div>

            {/* 4. Tarjetas de Metadatos Públicos Técnicos (Empresa y Monto eliminados para privacidad) */}
            <div className="grid grid-cols-1 gap-2 text-xs text-slate-700">
              {/* Delegación */}
              <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50/80 border border-slate-100">
                <MapPin size={15} className="text-toluca-gold shrink-0" />
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Delegación / Ubicación</span>
                  <span className="text-xs font-semibold text-slate-800">{obra.delegacion || obra.evidencias?.idDelegacion || 'Toluca Centro'}</span>
                </div>
              </div>

              {/* Avance Lineal si es tramo */}
              {obra.metrosLineales ? (
                <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50/80 border border-slate-100">
                  <Ruler size={15} className="text-blue-600 shrink-0" />
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Metros Lineales (Avance)</span>
                    <span className="text-xs font-semibold text-slate-800">{obra.metrosLineales.toLocaleString()} ML</span>
                  </div>
                </div>
              ) : null}

              {/* Periodo de Ejecución */}
              <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50/80 border border-slate-100">
                <Calendar size={15} className="text-slate-500 shrink-0" />
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Periodo de Ejecución</span>
                  <span className="text-xs font-semibold text-slate-800">
                    {formatDate(obra.fechaInicio)} al {formatDate(obra.fechaFin)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: VISOR FOTOGRÁFICO Y SELECTORES (7 columnas lg, centrado verticalmente) */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-3 my-auto">
            
            {/* Visor Principal ("Imagen en Grande") */}
            <div className="relative w-full aspect-[16/10] bg-slate-900 rounded-2xl overflow-hidden shadow-inner border border-slate-800 flex items-center justify-center group">
              {currentSrc && !imgError ? (
                <>
                  <img
                    key={currentSrc}
                    src={currentSrc}
                    alt={`Evidencia etapa ${etapaActiva}`}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => {
                      setImgLoaded(true);
                      setImgError(false);
                    }}
                    onError={() => {
                      if (!triedFallback && fallbackUrl && currentSrc !== fallbackUrl) {
                        setTriedFallback(true);
                        setCurrentSrc(fallbackUrl);
                      } else {
                        setImgLoaded(true);
                        setImgError(true);
                      }
                    }}
                  />

                  {/* Estado de carga */}
                  {!imgLoaded && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-900">
                      <div className="w-7 h-7 border-2 border-toluca-burgundy border-t-transparent rounded-full animate-spin mb-2" />
                      <span className="text-[11px]">Cargando fotografía...</span>
                    </div>
                  )}

                  {/* Etiqueta de la etapa activa sobre la imagen */}
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[11px] font-bold flex items-center gap-1.5 shadow-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-toluca-gold" />
                    Etapa: {etapaActiva.toUpperCase()} {etapaActiva === 'proceso' && totalProceso > 1 ? `(${procesoIndex + 1}/${totalProceso})` : ''}
                  </div>

                  {/* Botón para Zoom / Pantalla Completa */}
                  <button
                    onClick={() => setIsZoomed(true)}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white transition-transform hover:scale-105 shadow-md focus:outline-none"
                    title="Ver en pantalla completa"
                  >
                    <Maximize2 size={15} />
                  </button>

                  {/* Flechas del carrusel en la imagen (cuando etapa es proceso y hay >1 foto) */}
                  {etapaActiva === 'proceso' && totalProceso > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePrevProceso();
                        }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-sm transition-all hover:scale-110 shadow-lg focus:outline-none"
                        title="Foto anterior"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNextProceso();
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-sm transition-all hover:scale-110 shadow-lg focus:outline-none"
                        title="Foto siguiente"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </>
                  )}
                </>
              ) : (
                /* Estado cuando no hay foto para esta etapa */
                <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400">
                  <div className="w-12 h-12 rounded-xl bg-slate-800/80 flex items-center justify-center mb-2.5 text-slate-500 border border-slate-700/50">
                    <ImageIcon size={26} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-200 mb-0.5">
                    Fotografía en preparación
                  </h4>
                  <p className="text-[11px] text-slate-400 max-w-xs leading-snug">
                    No se ha registrado fotografía para la etapa <b className="text-slate-300 capitalize">{etapaActiva}</b> de esta obra.
                  </p>
                </div>
              )}
            </div>

            {/* Carrusel / Línea de tiempo de avance para etapa de Proceso */}
            {etapaActiva === 'proceso' && totalProceso > 1 && (
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 shadow-sm animate-in fade-in duration-150">
                <div className="flex items-center justify-between mb-1.5 px-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-toluca-burgundy animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">
                      Línea de tiempo de avance en obra
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500">
                    Evidencia {procesoIndex + 1} de {totalProceso}
                  </span>
                </div>

                {/* Stepper / Timeline horizontal interactivo */}
                <div className="relative flex items-center justify-between px-4 py-1.5">
                  {/* Línea conectora base */}
                  <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-200 rounded-full" />
                  
                  {/* Línea de progreso activa */}
                  <div 
                    className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-toluca-burgundy rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(procesoIndex / Math.max(1, totalProceso - 1)) * 100}%`,
                      maxWidth: 'calc(100% - 3rem)' 
                    }}
                  />

                  {Array.from({ length: totalProceso }).map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setProcesoIndex(idx)}
                      className="relative z-10 flex flex-col items-center group focus:outline-none"
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all shadow-sm ${
                        idx === procesoIndex
                          ? 'bg-toluca-burgundy text-white ring-4 ring-rose-200 scale-110'
                          : idx < procesoIndex
                            ? 'bg-rose-700 text-white'
                            : 'bg-white border-2 border-slate-300 text-slate-500 hover:border-toluca-burgundy hover:text-toluca-burgundy'
                      }`}>
                        {idx + 1}
                      </div>
                      <span className={`text-[9px] mt-0.5 font-bold tracking-tight transition-colors ${
                        idx === procesoIndex ? 'text-toluca-burgundy font-black' : 'text-slate-400 group-hover:text-slate-600'
                      }`}>
                        Fase {idx + 1}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Selector de 3 Tarjetas Inferiores: [ 1 ] Inicial, [ 2 ] Proceso, [ 3 ] Terminado */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              
              {/* Botón 1: Inicial */}
              <button
                type="button"
                onClick={() => setEtapaActiva('inicio')}
                className={`relative flex flex-col items-center justify-center p-2.5 rounded-xl border-2 transition-all text-left focus:outline-none ${
                  etapaActiva === 'inicio'
                    ? 'border-toluca-burgundy bg-rose-50/50 shadow-md shadow-rose-900/10 scale-[1.02]'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${
                    etapaActiva === 'inicio' ? 'bg-toluca-burgundy text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    1
                  </span>
                  <span className="text-xs font-bold text-slate-900">Inicial</span>
                </div>
                <span className="text-[9px] text-slate-500 font-medium">
                  {hasInicio ? '1 Foto disponible' : 'Sin evidencia'}
                </span>
                {hasInicio && (
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                )}
              </button>

              {/* Botón 2: Proceso */}
              <button
                type="button"
                onClick={() => setEtapaActiva('proceso')}
                className={`relative flex flex-col items-center justify-center p-2.5 rounded-xl border-2 transition-all text-left focus:outline-none ${
                  etapaActiva === 'proceso'
                    ? 'border-toluca-burgundy bg-rose-50/50 shadow-md shadow-rose-900/10 scale-[1.02]'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${
                    etapaActiva === 'proceso' ? 'bg-toluca-burgundy text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    2
                  </span>
                  <span className="text-xs font-bold text-slate-900">Proceso</span>
                </div>
                <span className="text-[9px] text-slate-500 font-medium">
                  {hasProceso ? `${totalProceso} Foto${totalProceso > 1 ? 's' : ''}` : 'Sin evidencia'}
                </span>
                {hasProceso && (
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                )}
              </button>

              {/* Botón 3: Terminado */}
              <button
                type="button"
                onClick={() => setEtapaActiva('terminado')}
                className={`relative flex flex-col items-center justify-center p-2.5 rounded-xl border-2 transition-all text-left focus:outline-none ${
                  etapaActiva === 'terminado'
                    ? 'border-toluca-burgundy bg-rose-50/50 shadow-md shadow-rose-900/10 scale-[1.02]'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${
                    etapaActiva === 'terminado' ? 'bg-toluca-burgundy text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    3
                  </span>
                  <span className="text-xs font-bold text-slate-900">Terminado</span>
                </div>
                <span className="text-[9px] text-slate-500 font-medium">
                  {hasTerminado ? '1 Foto disponible' : 'Sin evidencia'}
                </span>
                {hasTerminado && (
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                )}
              </button>

            </div>

          </div>

        </div>

      </div>

      {/* Lightbox / Zoom modal en alta definición si el usuario hace clic en pantalla completa */}
      {isZoomed && currentSrc && (
        <div 
          className="fixed inset-0 z-[4000] bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsZoomed(false)}
        >
          <button
            onClick={() => setIsZoomed(false)}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
          >
            <X size={24} />
          </button>
          <img
            src={currentSrc}
            alt="Evidencia ampliada"
            className="max-w-full max-h-[92vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};
