export type ModuloObraId = 
  | 'todos'
  | 'multiple'
  | 'bacheo'
  | 'pavimentacion'
  | 'slurry'
  | 'senderos'
  | 'arcotechos'
  | 'pozos'
  | 'senalamiento'
  | 'equipamiento'
  | 'dragon';

export type SubtipoPavimentacion = 
  | 'asfaltica'
  | 'hidraulico'
  | 'ecologico'
  | 'otra';

export type EstadoTemporalObra = 
  | 'POR_INICIAR'
  | 'EN_EJECUCION'
  | 'CONCLUIDA';

export type YearFilter = '2025' | '2026' | '2027' | 'todos';

export interface ObraEvidenciasFotos {
  inicio?: string | null;
  proceso: string[];
  terminado?: string | null;
  fotosDragon?: string[];
}

export interface ObraEvidenciaData {
  idContrato: string;
  noContrato: string;
  nombreObra?: string;
  tipoObra?: string;
  idEmpresa?: string;
  idDelegacion?: string;
  montoContratado?: string;
  fechaInicio?: string;
  fechaFin?: string;
  categoria?: string;
  fotos: ObraEvidenciasFotos;
  fotosFallback?: ObraEvidenciasFotos;
}

export interface ObraBase {
  id: string;
  contrato: string;
  nombre: string;
  tipo: ModuloObraId;
  subtipo?: SubtipoPavimentacion | string;
  tipoRaw?: string;
  anio?: number;
  fechaInicio?: Date | null;
  fechaFin?: Date | null;
  delegacion?: string;
  superficie?: number;
  metrosLineales?: number;
  inversion?: string;
  idContrato?: string;
  contratista?: string;
  montoContratado?: string;
  evidencias?: ObraEvidenciaData;
}

export interface ObraTramo extends ObraBase {
  geometriaTipo: 'tramo';
  coords: [number, number][]; // [[lat, lng], [lat, lng], ...]
}

export interface ObraPuntual extends ObraBase {
  geometriaTipo: 'puntual';
  lat: number;
  lng: number;
}

export type Obra = ObraTramo | ObraPuntual;

export interface ModulosConfig {
  id: ModuloObraId;
  nombre: string;
  descripcion: string;
  color: string;
  geometria: 'tramo' | 'puntual' | 'mixto';
  icono: string;
}

export interface FiltrosModulos {
  moduloActivo: ModuloObraId;
  // Visibilidad independiente por módulo
  showBacheo: boolean;
  showPavimentacion: boolean;
  showSlurry: boolean;
  showSenderos: boolean;
  showArcotechos: boolean;
  showPozos: boolean;
  showSenalamiento: boolean;
  showEquipamiento: boolean;
  showDragon: boolean;
  // Subtipos de pavimentación
  pavAsfaltica: boolean;
  pavHidraulico: boolean;
  pavEcologico: boolean;
  // Estados de ejecución
  showConcluidas: boolean;
  showEnProceso: boolean;
  showProgramadas: boolean;
  // Capas de Demanda Ciudadana y Peticiones
  showDemandaCiudadana?: boolean;
  showPeticionesCiudadanas?: boolean;
  // Capa Plan de Trabajo (Proyectos Ejecutivos)
  showPlanTrabajo?: boolean;
}

export interface PlanTrabajoFeature {
  id: string;
  nombre: string;
  delegacion: string;
  tipoPavimento: string;
  metrosLineales: number;
  anchoCalzadaM: number;
  superficieM2: number;
  costoUnitarioM2: number;
  presupuestoEstimadoMxn: number;
  bachesPreviosCorredor: number;
  peticionesCiudadanasCorredor: number;
  coords: [number, number][]; // [[lat, lng], [lat, lng], ...]
}

export interface DemandaCiudadana {
  id: string;
  ticket: string;
  solicitante: string;
  observaciones: string;
  calleYNumero: string;
  trabajo: string;
  delegacion: string;
  lat: number;
  lng: number;
}

export interface PeticionCiudadana {
  id: string;
  noProg: string;
  fecha: string;
  oficio: string;
  asunto: string;
  tipoSolicitud: string;
  calle: string;
  delegacion: string;
  lat: number;
  lng: number;
}
