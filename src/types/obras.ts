export type ModuloObraId = 
  | 'todos'
  | 'bacheo'
  | 'pavimentacion'
  | 'slurry'
  | 'senderos'
  | 'arcotechos'
  | 'pozos'
  | 'senalamiento'
  | 'equipamiento';

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
  // Subtipos de pavimentación
  pavAsfaltica: boolean;
  pavHidraulico: boolean;
  pavEcologico: boolean;
  // Estados de ejecución
  showConcluidas: boolean;
  showEnProceso: boolean;
  showProgramadas: boolean;
}
