import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Ruler, 
  Building2, 
  DollarSign, 
  Maximize2, 
  Image as ImageIcon,
  CheckCircle2,
  Clock
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
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide bg-blue-50 text-blue-700 border border-blue-200 shadow-sm">
          <CheckCircle2 size={13} className="text-blue-600" />
          CONCLUIDA
        </span>
      );
    }
    if (status === 'EN_EJECUCION') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-0.5" />
          EN EJECUCIÓN
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide bg-amber-50 text-amber-700 border border-amber-200 shadow-sm">
        <Clock size={13} className="text-amber-600" />
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-toluca-burgundy" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Detalle y Evidencias de Obra Pública 2026
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors focus:outline-none"
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo del Modal: 2 Columnas (Diseño Fiel al Boceto) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-y-auto">
          
          {/* COLUMNA IZQUIERDA: INFORMACIÓN DE CONTRATO Y OBRA (5 columnas lg) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
            <div>
              {/* 1. Número de Contrato Prominente (Arriba) */}
              <div className="mb-2">
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                  Número de Contrato
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight break-words font-mono">
                  {obra.contrato || obra.evidencias?.noContrato || 'S/N'}
                </h2>
              </div>

              {/* 2. Badges: idContrato y Estado */}
              <div className="flex flex-wrap items-center gap-2 my-3">
                {obra.idContrato ? (
                  <span className="px-3 py-1 bg-toluca-burgundy text-white rounded-full text-xs font-black tracking-wider uppercase shadow-sm">
                    {obra.idContrato}
                  </span>
                ) : null}
                {renderStatusBadge()}
                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold uppercase">
                  {obra.tipo.toUpperCase()}{obra.subtipo ? ` · ${obra.subtipo}` : ''}
                </span>
              </div>

              {/* 3. Nombre / Descripción Completa de la Obra */}
              <div className="mt-4 p-4 rounded-xl bg-slate-50/80 border border-slate-100">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">
                  Descripción Oficial de la Obra
                </span>
                <p className="text-sm sm:text-base font-semibold text-slate-800 leading-relaxed">
                  "{obra.nombre || obra.evidencias?.nombreObra || 'Sin descripción disponible'}"
                </p>
              </div>
            </div>

            {/* 4. Tarjetas de Metadatos Técnicos */}
            <div className="grid grid-cols-1 gap-2.5 text-xs text-slate-700">
              {/* Delegación */}
              <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <MapPin size={16} className="text-toluca-gold shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Delegación / Ubicación</span>
                  <span className="font-semibold text-slate-900">{obra.delegacion || obra.evidencias?.idDelegacion || 'Toluca Centro'}</span>
                </div>
              </div>

              {/* Avance Lineal si es tramo */}
              {obra.metrosLineales ? (
                <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <Ruler size={16} className="text-blue-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Metros Lineales (Avance)</span>
                    <span className="font-semibold text-slate-900">{obra.metrosLineales.toLocaleString()} ML</span>
                  </div>
                </div>
              ) : null}

              {/* Periodo de Ejecución */}
              <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <Calendar size={16} className="text-slate-500 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Periodo de Ejecución</span>
                  <span className="font-semibold text-slate-900">
                    {formatDate(obra.fechaInicio)} al {formatDate(obra.fechaFin)}
                  </span>
                </div>
              </div>

              {/* Contratista y Monto (si existen) */}
              {(obra.contratista || obra.evidencias?.idEmpresa) && (
                <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <Building2 size={16} className="text-purple-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Empresa Contratista</span>
                    <span className="font-semibold text-slate-900">{obra.contratista || obra.evidencias?.idEmpresa}</span>
                  </div>
                </div>
              )}

              {(obra.montoContratado || obra.evidencias?.montoContratado) && (
                <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <DollarSign size={16} className="text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Monto Contratado</span>
                    <span className="font-semibold text-slate-900">{obra.montoContratado || obra.evidencias?.montoContratado}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* COLUMNA DERECHA: VISOR FOTOGRÁFICO Y SELECTORES (7 columnas lg) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
            
            {/* Visor Principal ("Imagen en Grande") */}
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-slate-900 rounded-2xl overflow-hidden shadow-inner border border-slate-800 flex items-center justify-center group">
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
                      <div className="w-8 h-8 border-3 border-toluca-burgundy border-t-transparent rounded-full animate-spin mb-2" />
                      <span className="text-xs">Cargando fotografía...</span>
                    </div>
                  )}

                  {/* Etiqueta de la etapa activa sobre la imagen */}
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold flex items-center gap-1.5 shadow-md">
                    <span className="w-2 h-2 rounded-full bg-toluca-gold" />
                    Etapa: {etapaActiva.toUpperCase()} {etapaActiva === 'proceso' && Math.max(fotosProceso.length, fallbackProceso.length) > 1 ? `(${procesoIndex + 1}/${Math.max(fotosProceso.length, fallbackProceso.length)})` : ''}
                  </div>

                  {/* Botón para Zoom / Pantalla Completa */}
                  <button
                    onClick={() => setIsZoomed(true)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white transition-transform hover:scale-105 shadow-md focus:outline-none"
                    title="Ver en pantalla completa"
                  >
                    <Maximize2 size={16} />
                  </button>

                  {/* Si hay múltiples fotos en proceso, botones de navegación anterior / siguiente */}
                  {etapaActiva === 'proceso' && Math.max(fotosProceso.length, fallbackProceso.length) > 1 && (
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-md p-1 rounded-full text-white">
                      {Array.from({ length: Math.max(fotosProceso.length, fallbackProceso.length) }).map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setProcesoIndex(idx)}
                          className={`w-6 h-6 rounded-full text-xs font-bold transition-all ${idx === procesoIndex ? 'bg-toluca-burgundy text-white' : 'text-slate-300 hover:text-white'}`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                /* Estado cuando no hay foto para esta etapa */
                <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center mb-3 text-slate-500 border border-slate-700/50">
                    <ImageIcon size={32} />
                  </div>
                  <h4 className="text-base font-bold text-slate-200 mb-1">
                    Fotografía en preparación
                  </h4>
                  <p className="text-xs text-slate-400 max-w-xs leading-snug">
                    No se ha registrado fotografía para la etapa <b className="text-slate-300 capitalize">{etapaActiva}</b> de esta obra.
                  </p>
                </div>
              )}
            </div>

            {/* Selector de 3 Tarjetas/Botones Inferiores: [ 1 ] Inicial, [ 2 ] Proceso, [ 3 ] Terminado */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              
              {/* Botón 1: Inicial */}
              <button
                type="button"
                onClick={() => {
                  setEtapaActiva('inicio');
                }}
                className={`relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all text-left focus:outline-none ${
                  etapaActiva === 'inicio'
                    ? 'border-toluca-burgundy bg-rose-50/50 shadow-md shadow-rose-900/10 scale-[1.02]'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black ${
                    etapaActiva === 'inicio' ? 'bg-toluca-burgundy text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    1
                  </span>
                  <span className="text-xs font-bold text-slate-900">Inicial</span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">
                  {hasInicio ? '1 Foto disponible' : 'Sin evidencia'}
                </span>
                {hasInicio && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500" />
                )}
              </button>

              {/* Botón 2: Proceso */}
              <button
                type="button"
                onClick={() => {
                  setEtapaActiva('proceso');
                }}
                className={`relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all text-left focus:outline-none ${
                  etapaActiva === 'proceso'
                    ? 'border-toluca-burgundy bg-rose-50/50 shadow-md shadow-rose-900/10 scale-[1.02]'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black ${
                    etapaActiva === 'proceso' ? 'bg-toluca-burgundy text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    2
                  </span>
                  <span className="text-xs font-bold text-slate-900">Proceso</span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">
                  {hasProceso ? `${Math.max(fotosProceso.length, fallbackProceso.length)} Foto${Math.max(fotosProceso.length, fallbackProceso.length) > 1 ? 's' : ''}` : 'Sin evidencia'}
                </span>
                {hasProceso && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500" />
                )}
              </button>

              {/* Botón 3: Terminado */}
              <button
                type="button"
                onClick={() => {
                  setEtapaActiva('terminado');
                }}
                className={`relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all text-left focus:outline-none ${
                  etapaActiva === 'terminado'
                    ? 'border-toluca-burgundy bg-rose-50/50 shadow-md shadow-rose-900/10 scale-[1.02]'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black ${
                    etapaActiva === 'terminado' ? 'bg-toluca-burgundy text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    3
                  </span>
                  <span className="text-xs font-bold text-slate-900">Terminado</span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">
                  {hasTerminado ? '1 Foto disponible' : 'Sin evidencia'}
                </span>
                {hasTerminado && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500" />
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
