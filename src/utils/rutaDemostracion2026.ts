import type { ObraTramo } from '../types/obras.ts';

export interface DemoTourStep {
  stepIndex: number;
  bloque: 1 | 2 | 3;
  bloqueNombre: string;
  numeroEnBloque: number;
  totalEnBloque: number;
  tipoObraPdf: string;
  calle: string;
  descripcionPdf: string;
  delegacion: string;
  metrosLineales: number;
  superficieM2: number;
  estatusPdf: string;
  contratoKey: string | null;
  lpnNum: number | null;
  dragonId: string | null;
  gidemId: number | null;
  hasPhotosExpected: boolean;
  fallbackCoords: [number, number][];
}

export const PDF_TOTAL_KM = 51.03;
export const PDF_TOTAL_M2 = 273370.48;

export const RUTA_DEMOSTRACION_2026: DemoTourStep[] = [
  {
    "stepIndex": 1,
    "bloque": 1,
    "bloqueNombre": "Pavimentación y Concretos",
    "numeroEnBloque": 1,
    "totalEnBloque": 19,
    "tipoObraPdf": "CONCRETO ECOLÓGICO",
    "calle": "DESIERTO DEL CARMEN",
    "descripcionPdf": "CONSTRUCCIÓN PAVIMENTACIÓN CON CONCRETO ECOLÓGICO EN LA CALLE DESIERTO DEL CARMEN, DEL TRAMO COMPRENDIDO ENTRE BOULEVARD SOLIDARIDAD LAS TORRES Y CALLE PARQUE EL OCOTAL, DELEGACIÓN ADOLFO LÓPEZ MATEOS, MUNICIPIO DE TOLUCA.",
    "delegacion": "ADOLFO LÓPEZ MATEOS",
    "metrosLineales": 74.48,
    "superficieM2": 468.2,
    "estatusPdf": "TERMINADA",
    "contratoKey": "MT/DGOP/FAISMUN/LPN-065/2026",
    "lpnNum": 65,
    "dragonId": null,
    "gidemId": null,
    "hasPhotosExpected": true,
    "fallbackCoords": [
      [
        19.281362,
        -99.695355
      ],
      [
        19.281962,
        -99.695391
      ]
    ]
  },
  {
    "stepIndex": 2,
    "bloque": 1,
    "bloqueNombre": "Pavimentación y Concretos",
    "numeroEnBloque": 2,
    "totalEnBloque": 19,
    "tipoObraPdf": "CONCRETO ECOLÓGICO",
    "calle": "NAUCALLI",
    "descripcionPdf": "CONSTRUCCIÓN PAVIMENTACIÓN CON CONCRETO ECOLÓGICO EN LA CALLE NAUCALLI, DEL TRAMO COMPRENDIDO ENTRE BOULEVARD SOLIDARIDAD LAS TORRES Y CALLE TORRES CHICAS, DELEGACIÓN ADOLFO LÓPEZ MATEOS, MUNICIPIO DE TOLUCA.",
    "delegacion": "ADOLFO LÓPEZ MATEOS",
    "metrosLineales": 252.15,
    "superficieM2": 1422.0,
    "estatusPdf": "EN PROCESO",
    "contratoKey": "MT/DGOP/FAISMUN/LPN-087/2026",
    "lpnNum": 87,
    "dragonId": null,
    "gidemId": null,
    "hasPhotosExpected": true,
    "fallbackCoords": [
      [
        19.28122,
        -99.694756
      ],
      [
        19.281281,
        -99.692449
      ]
    ]
  },
  {
    "stepIndex": 3,
    "bloque": 1,
    "bloqueNombre": "Pavimentación y Concretos",
    "numeroEnBloque": 3,
    "totalEnBloque": 19,
    "tipoObraPdf": "CONCRETO ECOLÓGICO",
    "calle": "PARQUE DE LOS REMEDIOS",
    "descripcionPdf": "CONSTRUCCIÓN PAVIMENTACIÓN CON CONCRETO ECOLÓGICO EN LA CALLE PARQUE DE LOS REMEDIOS, DEL TRAMO COMPRENDIDO ENTRE BOULEVARD SOLIDARIDAD LAS TORRES Y CALLE PARQUE NEVADO DE TOLUCA, DELEGACIÓN ADOLFO LÓPEZ MATEOS, MUNICIPIO DE TOLUCA.",
    "delegacion": "ADOLFO LÓPEZ MATEOS",
    "metrosLineales": 146.76,
    "superficieM2": 1228.9,
    "estatusPdf": "EN PROCESO",
    "contratoKey": "MT/DGOP/FAISMUN/LPN-067/2026",
    "lpnNum": 67,
    "dragonId": null,
    "gidemId": null,
    "hasPhotosExpected": true,
    "fallbackCoords": [
      [
        19.282235,
        -99.69804
      ],
      [
        19.282529,
        -99.698051
      ]
    ]
  },
  {
    "stepIndex": 4,
    "bloque": 1,
    "bloqueNombre": "Pavimentación y Concretos",
    "numeroEnBloque": 4,
    "totalEnBloque": 19,
    "tipoObraPdf": "CONCRETO ECOLÓGICO",
    "calle": "PARQUE MATLAZINCAS",
    "descripcionPdf": "CONSTRUCCIÓN PAVIMENTACIÓN CON CONCRETO ECOLÓGICO EN LA CALLE PARQUE MATLAZINCAS, DEL TRAMO COMPRENDIDO ENTRE BOULEVARD SOLIDARIDAD LAS TORRES Y CALLE LA MARQUESA, DELEGACIÓN ADOLFO LÓPEZ MATEOS, MUNICIPIO DE TOLUCA.",
    "delegacion": "ADOLFO LÓPEZ MATEOS",
    "metrosLineales": 150.47,
    "superficieM2": 1194.5,
    "estatusPdf": "TERMINADA",
    "contratoKey": "MT/DGOP/FAISMUN/LPN-066/2026",
    "lpnNum": 66,
    "dragonId": null,
    "gidemId": null,
    "hasPhotosExpected": true,
    "fallbackCoords": [
      [
        19.281499,
        -99.695881
      ],
      [
        19.282821,
        -99.695932
      ]
    ]
  },
  {
    "stepIndex": 5,
    "bloque": 1,
    "bloqueNombre": "Pavimentación y Concretos",
    "numeroEnBloque": 5,
    "totalEnBloque": 19,
    "tipoObraPdf": "CONCRETO ECOLÓGICO",
    "calle": "PARQUE MOLINO DE LAS FLORES",
    "descripcionPdf": "CONSTRUCCIÓN PAVIMENTACIÓN CON CONCRETO ECOLÓGICO EN LA CALLE PARQUE MOLINO DE LAS FLORES, DEL TRAMO COMPRENDIDO ENTRE BOULEVARD SOLIDARIDAD LAS TORRES Y CALLE ISLA DE LAS AVES, DELEGACIÓN ADOLFO LÓPEZ MATEOS, MUNICIPIO DE TOLUCA.",
    "delegacion": "ADOLFO LÓPEZ MATEOS",
    "metrosLineales": 44.5,
    "superficieM2": 342.5,
    "estatusPdf": "TERMINADA",
    "contratoKey": "MT/DGOP/FAISMUN/LPN-064/2026",
    "lpnNum": 64,
    "dragonId": null,
    "gidemId": null,
    "hasPhotosExpected": true,
    "fallbackCoords": [
      [
        19.279986,
        -99.691035
      ],
      [
        19.280364,
        -99.691083
      ]
    ]
  },
  {
    "stepIndex": 6,
    "bloque": 1,
    "bloqueNombre": "Pavimentación y Concretos",
    "numeroEnBloque": 6,
    "totalEnBloque": 19,
    "tipoObraPdf": "CONCRETO ECOLÓGICO",
    "calle": "PARQUE OTOMÍ",
    "descripcionPdf": "CONSTRUCCIÓN PAVIMENTACIÓN CON CONCRETO ECOLÓGICO EN LA CALLE PARQUE OTOMÍ, DEL TRAMO COMPRENDIDO ENTRE BOULEVARD SOLIDARIDAD LAS TORRES Y CALLE PARQUE NAUCALLI, DELEGACIÓN ADOLFO LÓPEZ MATEOS, MUNICIPIO DE TOLUCA.",
    "delegacion": "ADOLFO LÓPEZ MATEOS",
    "metrosLineales": 41.08,
    "superficieM2": 420.0,
    "estatusPdf": "TERMINADA",
    "contratoKey": "MT/DGOP/FAISMUN/LPN-086/2026",
    "lpnNum": 86,
    "dragonId": null,
    "gidemId": null,
    "hasPhotosExpected": true,
    "fallbackCoords": [
      [
        19.280791,
        -99.693721
      ],
      [
        19.281153,
        -99.693755
      ]
    ]
  },
  {
    "stepIndex": 7,
    "bloque": 1,
    "bloqueNombre": "Pavimentación y Concretos",
    "numeroEnBloque": 7,
    "totalEnBloque": 19,
    "tipoObraPdf": "CONCRETO ECOLÓGICO",
    "calle": "PARQUE TEPOTZOTLÁN",
    "descripcionPdf": "CONSTRUCCIÓN PAVIMENTACIÓN CON CONCRETO ECOLÓGICO EN LA CALLE PARQUE TEPOTZOTLÁN, DEL TRAMO COMPRENDIDO ENTRE CALLE PARQUE DE LOS CIERVOS Y BOULEVARD SOLIDARIDAD LAS TORRES, DELEGACIÓN ADOLFO LÓPEZ MATEOS, MUNICIPIO DE TOLUCA.",
    "delegacion": "ADOLFO LÓPEZ MATEOS",
    "metrosLineales": 90.29,
    "superficieM2": 802.2,
    "estatusPdf": "TERMINADA",
    "contratoKey": "MT/DGOP/FAISMUN/LPN-062/2026",
    "lpnNum": 62,
    "dragonId": null,
    "gidemId": null,
    "hasPhotosExpected": true,
    "fallbackCoords": [
      [
        19.279644,
        -99.687863
      ],
      [
        19.278878,
        -99.687794
      ]
    ]
  },
  {
    "stepIndex": 8,
    "bloque": 1,
    "bloqueNombre": "Pavimentación y Concretos",
    "numeroEnBloque": 8,
    "totalEnBloque": 19,
    "tipoObraPdf": "CONCRETO ECOLÓGICO",
    "calle": "PARQUE VALLE ESCONDIDO",
    "descripcionPdf": "CONSTRUCCIÓN PAVIMENTACIÓN CON CONCRETO ECOLÓGICO EN LA CALLE PARQUE VALLE ESCONDIDO, DEL TRAMO COMPRENDIDO ENTRE BOULEVARD SOLIDARIDAD LAS TORRES Y CALLE ISLA DE LAS AVES, DELEGACIÓN ADOLFO LÓPEZ MATEOS, MUNICIPIO DE TOLUCA.",
    "delegacion": "ADOLFO LÓPEZ MATEOS",
    "metrosLineales": 91.68,
    "superficieM2": 824.95,
    "estatusPdf": "TERMINADA",
    "contratoKey": "MT/DGOP/FAISMUN/LPN-063/2026",
    "lpnNum": 63,
    "dragonId": null,
    "gidemId": null,
    "hasPhotosExpected": true,
    "fallbackCoords": [
      [
        19.280427,
        -99.690035
      ],
      [
        19.279654,
        -99.689985
      ]
    ]
  },
  {
    "stepIndex": 9,
    "bloque": 1,
    "bloqueNombre": "Pavimentación y Concretos",
    "numeroEnBloque": 9,
    "totalEnBloque": 19,
    "tipoObraPdf": "CONCRETO ECOLÓGICO",
    "calle": "PARQUE ZEMPOALA",
    "descripcionPdf": "CONSTRUCCIÓN PAVIMENTACIÓN CON CONCRETO ECOLÓGICO EN LA CALLE PARQUE ZEMPOALA, DEL TRAMO COMPRENDIDO ENTRE CALLE PARQUE EL OCOTAL Y CALLE PARQUE LA MARQUESA, DELEGACIÓN ADOLFO LÓPEZ MATEOS, MUNICIPIO DE TOLUCA.",
    "delegacion": "ADOLFO LÓPEZ MATEOS",
    "metrosLineales": 92.63,
    "superficieM2": 541.1,
    "estatusPdf": "EN PROCESO",
    "contratoKey": "MT/DGOP/FAISMUN/LPN-098/2026",
    "lpnNum": 98,
    "dragonId": null,
    "gidemId": null,
    "hasPhotosExpected": true,
    "fallbackCoords": [
      [
        19.281962,
        -99.695391
      ],
      [
        19.282795,
        -99.69542
      ]
    ]
  },
  {
    "stepIndex": 10,
    "bloque": 1,
    "bloqueNombre": "Pavimentación y Concretos",
    "numeroEnBloque": 10,
    "totalEnBloque": 19,
    "tipoObraPdf": "CONCRETO HIDRÁULICO",
    "calle": "EL NEVADO",
    "descripcionPdf": "CONSTRUCCIÓN DE PAVIMENTACIÓN CON CONCRETO HIDRÁULICO EN LA CALLE EL NEVADO, DEL TRAMO COMPRENDIDO ENTRE CALLE CEDRO Y CALZADA DE LOS MISTERIOS, DELEGACIÓN CACALOMACÁN, MUNICIPIO DE TOLUCA.",
    "delegacion": "CACALOMACÁN",
    "metrosLineales": 596.35,
    "superficieM2": 4208.4,
    "estatusPdf": "TERMINADA",
    "contratoKey": "MT/DGOP/FAISMUN/LPN-059/2026",
    "lpnNum": 59,
    "dragonId": null,
    "gidemId": null,
    "hasPhotosExpected": true,
    "fallbackCoords": [
      [
        19.247691,
        -99.709489
      ],
      [
        19.247078,
        -99.709901
      ],
      [
        19.246011,
        -99.712197
      ]
    ]
  },
  {
    "stepIndex": 11,
    "bloque": 1,
    "bloqueNombre": "Pavimentación y Concretos",
    "numeroEnBloque": 11,
    "totalEnBloque": 19,
    "tipoObraPdf": "CONCRETO ECOLÓGICO",
    "calle": "IGNACIO MANUEL ALTAMIRANO",
    "descripcionPdf": "CONSTRUCCIÓN DE PAVIMENTACIÓN CON CONCRETO ECOLÓGICO EN LA CALLE IGNACIO MANUEL ALTAMIRANO, DEL TRAMO COMPRENDIDO ENTRE CALLE GENERAL ABELARDO RODRÍGUEZ Y LA PROLONGACIÓN GENERAL JUAN ANDREW ALMAZÁN, DELEGACIÓN DEL PARQUE, MUNICIPIO DE TOLUCA.",
    "delegacion": "DEL PARQUE",
    "metrosLineales": 93.04,
    "superficieM2": 649.8,
    "estatusPdf": "TERMINADA",
    "contratoKey": "MT/DGOP/FAISMUN/LPN-061/2026",
    "lpnNum": 61,
    "dragonId": null,
    "gidemId": null,
    "hasPhotosExpected": true,
    "fallbackCoords": [
      [
        19.260567,
        -99.652669
      ],
      [
        19.261379,
        -99.652599
      ]
    ]
  },
  {
    "stepIndex": 12,
    "bloque": 1,
    "bloqueNombre": "Pavimentación y Concretos",
    "numeroEnBloque": 12,
    "totalEnBloque": 19,
    "tipoObraPdf": "CONCRETO HIDRÁULICO",
    "calle": "LAGO TANGANICA",
    "descripcionPdf": "CONSTRUCCIÓN DE PAVIMENTACIÓN CON CONCRETO HIDRÁULICO DE LA CALLE LAGO TANGANICA, EN EL TRAMO COMPRENDIDO ENTRE CALLE GENERAL FELIPE ÁNGELES Y CALLE TORRES CHICAS, DELEGACIÓN FELIPE CHÁVEZ BECERRIL, MUNICIPIO DE TOLUCA.",
    "delegacion": "FELIPE CHÁVEZ BECERRIL",
    "metrosLineales": 130.49,
    "superficieM2": 785.0,
    "estatusPdf": "TERMINADA",
    "contratoKey": "MT/DGOP/FAISMUN/LPN-099/2026",
    "lpnNum": 99,
    "dragonId": null,
    "gidemId": null,
    "hasPhotosExpected": true,
    "fallbackCoords": [
      [
        19.261019,
        -99.664005
      ],
      [
        19.262185,
        -99.66362
      ]
    ]
  },
  {
    "stepIndex": 13,
    "bloque": 1,
    "bloqueNombre": "Pavimentación y Concretos",
    "numeroEnBloque": 13,
    "totalEnBloque": 19,
    "tipoObraPdf": "PAVIMENTO ASFÁLTICO",
    "calle": "LAGUNA DE 7 COLORES",
    "descripcionPdf": "CONSTRUCCIÓN DE PAVIMENTACIÓN CON CARPETA ASFÁLTICA EN LA CALLE LAGUNA DE 7 COLORES ENTRE CALLE LAGO CARATASCA Y LAGUNA DE LOS GIGANTES, DELEGACIÓN NUEVA OXTOTITLÁN, MUNICIPIO DE TOLUCA.",
    "delegacion": "NUEVA OXTOTITLÁN",
    "metrosLineales": 26.8,
    "superficieM2": 515.4,
    "estatusPdf": "EN PROCESO",
    "contratoKey": "MT/DGOP/FAISMUN/LPN-104/2026",
    "lpnNum": 104,
    "dragonId": null,
    "gidemId": null,
    "hasPhotosExpected": true,
    "fallbackCoords": [
      [
        19.287485,
        -99.682605
      ],
      [
        19.28745,
        -99.68309
      ]
    ]
  },
  {
    "stepIndex": 14,
    "bloque": 1,
    "bloqueNombre": "Pavimentación y Concretos",
    "numeroEnBloque": 14,
    "totalEnBloque": 19,
    "tipoObraPdf": "PAVIMENTO ASFÁLTICO",
    "calle": "CERRADA FRIDA KAHLO",
    "descripcionPdf": "CONSTRUCCIÓN DE PAVIMENTACIÓN CON CARPETA ASFÁLTICA DE LA CALLE CERRADA FRIDA KAHLO, DEL TRAMO COMPRENDIDO ENTRE CALLE LIBERTAD AL CADENAMIENTO 0+278, DELEGACIÓN SAN FELIPE TLALMIMILOLPAN, MUNICIPIO DE TOLUCA.",
    "delegacion": "SAN FELIPE TLALMIMILOLPAN",
    "metrosLineales": 278.21,
    "superficieM2": 1567.3,
    "estatusPdf": "EN PROCESO",
    "contratoKey": "MT/DGOP/FAISMUN/LPN-092/2026",
    "lpnNum": 92,
    "dragonId": null,
    "gidemId": null,
    "hasPhotosExpected": true,
    "fallbackCoords": [
      [
        19.246206,
        -99.643174
      ],
      [
        19.246303,
        -99.645564
      ]
    ]
  },
  {
    "stepIndex": 15,
    "bloque": 1,
    "bloqueNombre": "Pavimentación y Concretos",
    "numeroEnBloque": 15,
    "totalEnBloque": 19,
    "tipoObraPdf": "PAVIMENTO ASFÁLTICO",
    "calle": "MANUEL GÓMEZ PEDRAZA",
    "descripcionPdf": "CONSTRUCCIÓN PAVIMENTACIÓN CON CARPETA ASFÁLTICA EN LA CALLE MANUEL GÓMEZ PEDRAZA, DEL TRAMO COMPRENDIDO ENTRE CALLE NICOLÁS BRAVO Y CALLE JOSÉ VICENTE VILLADA, DELEGACIÓN SAN PABLO AUTOPAN, MUNICIPIO DE TOLUCA.",
    "delegacion": "SAN PABLO AUTOPAN",
    "metrosLineales": 1017.03,
    "superficieM2": 9235.0,
    "estatusPdf": "TERMINADA",
    "contratoKey": "MT/DGOP/FAISMUN/LPN-060/2026",
    "lpnNum": 60,
    "dragonId": null,
    "gidemId": null,
    "hasPhotosExpected": true,
    "fallbackCoords": [
      [
        19.369644,
        -99.668077
      ],
      [
        19.369493,
        -99.663179
      ],
      [
        19.369507,
        -99.662451
      ],
      [
        19.369439,
        -99.662007
      ],
      [
        19.369683,
        -99.66035
      ],
      [
        19.369706,
        -99.659675
      ],
      [
        19.369734,
        -99.658454
      ]
    ]
  },
  {
    "stepIndex": 16,
    "bloque": 1,
    "bloqueNombre": "Pavimentación y Concretos",
    "numeroEnBloque": 16,
    "totalEnBloque": 19,
    "tipoObraPdf": "PAVIMENTO ASFÁLTICO",
    "calle": "ANDADOR PROL. CALLE TIANGUISTENCO",
    "descripcionPdf": "CONSTRUCCIÓN DE ANDADOR EN PROLONGACIÓN CALLE TIANGUISTENCO, DEL TRAMO COMPRENDIDO DE CALLE GENERAL AGUSTÍN MILLÁN HASTA PASEO MATLAZINCAS, DEL CADENAMIENTO 0+000 AL 0+123, DELEGACIÓN SÁNCHEZ, TOLUCA.",
    "delegacion": "SÁNCHEZ",
    "metrosLineales": 123.0,
    "superficieM2": 427.0,
    "estatusPdf": "EN PROCESO",
    "contratoKey": "MT/DGOP/FEFOM/LPN-115/2026",
    "lpnNum": 115,
    "dragonId": null,
    "gidemId": null,
    "hasPhotosExpected": true,
    "fallbackCoords": [
      [
        19.29676,
        -99.672309
      ],
      [
        19.297504,
        -99.67234
      ]
    ]
  },
  {
    "stepIndex": 17,
    "bloque": 1,
    "bloqueNombre": "Pavimentación y Concretos",
    "numeroEnBloque": 17,
    "totalEnBloque": 19,
    "tipoObraPdf": "CONCRETO HIDRÁULICO",
    "calle": "ALBERTO EINSTEIN",
    "descripcionPdf": "CONSTRUCCIÓN DE PAVIMENTACIÓN CON CONCRETO HIDRÁULICO DE LA CALLE ALBERTO EINSTEIN, DESDE PASEO VICENTE LOMBARDO TOLEDANO HASTA CADENAMIENTO 0+069, DELEGACIÓN SANTA ANA TLAPALTITLÁN, TOLUCA.",
    "delegacion": "SANTA ANA TLAPALTITLÁN",
    "metrosLineales": 69.0,
    "superficieM2": 690.0,
    "estatusPdf": "EN PROCESO",
    "contratoKey": "MT/DGOP/FEFOM/LPN-105/2026",
    "lpnNum": 105,
    "dragonId": null,
    "gidemId": null,
    "hasPhotosExpected": true,
    "fallbackCoords": [
      [
        19.305823,
        -99.604793
      ],
      [
        19.305328,
        -99.605056
      ]
    ]
  },
  {
    "stepIndex": 18,
    "bloque": 1,
    "bloqueNombre": "Pavimentación y Concretos",
    "numeroEnBloque": 18,
    "totalEnBloque": 19,
    "tipoObraPdf": "PAVIMENTO ASFÁLTICO",
    "calle": "NIKOLA TESLA",
    "descripcionPdf": "CONSTRUCCIÓN DE PAVIMENTACIÓN CON CARPETA ASFÁLTICA DE LA CALLE NIKOLA TESLA, EN EL TRAMO COMPRENDIDO DE PASEO VICENTE LOMBARDO TOLEDANO A CALLE CERRADA GUADALUPE VICTORIA, DEL CADENAMIENTO 0+000 AL 0+191, DELEGACIÓN SANTA ANA TLAPALTITLÁN, MUNICIPIO DE TOLUCA.",
    "delegacion": "SANTA ANA TLAPALTITLÁN",
    "metrosLineales": 191.0,
    "superficieM2": 1340.0,
    "estatusPdf": "EN AUTORIZACIÓN (GIDEM)",
    "contratoKey": null,
    "lpnNum": null,
    "dragonId": null,
    "gidemId": 2,
    "hasPhotosExpected": false,
    "fallbackCoords": [
      [
        19.306095,
        -99.606143
      ],
      [
        19.304381,
        -99.60624
      ]
    ]
  },
  {
    "stepIndex": 19,
    "bloque": 1,
    "bloqueNombre": "Pavimentación y Concretos",
    "numeroEnBloque": 19,
    "totalEnBloque": 19,
    "tipoObraPdf": "PAVIMENTO ASFÁLTICO",
    "calle": "ANTIGUO CAMINO A LA MAGDALENA",
    "descripcionPdf": "CONSTRUCCIÓN DE PAVIMENTACIÓN CON CARPETA ASFÁLTICA, GUARNICIONES Y BANQUETAS, EN ANTIGUO CAMINO A LA MAGDALENA, EN EL TRAMO COMPRENDIDO DE LA INTERSECCIÓN DE LAS CALLES PIES NEGROS Y PENSADOR MEXICANO A CALLE GANADERÍA, CADENAMIENTO 0+000 AL 0+571, DELEGACIÓN SANTA CRUZ ATZCAPOTZALTONGO.",
    "delegacion": "SANTA CRUZ ATZCAPOTZALTONGO",
    "metrosLineales": 571.0,
    "superficieM2": 468.0,
    "estatusPdf": "EN AUTORIZACIÓN (GIDEM)",
    "contratoKey": null,
    "lpnNum": null,
    "dragonId": null,
    "gidemId": 10,
    "hasPhotosExpected": false,
    "fallbackCoords": [
      [
        19.319081,
        -99.631366
      ],
      [
        19.314788,
        -99.634472
      ]
    ]
  },
  {
    "stepIndex": 20,
    "bloque": 2,
    "bloqueNombre": "Rehabilitación de Pavimento",
    "numeroEnBloque": 1,
    "totalEnBloque": 39,
    "tipoObraPdf": "REHABILITACIÓN DE PAVIMENTO",
    "calle": "INSURGENTES (CALIXTLAHUACA)",
    "descripcionPdf": "RECONSTRUCCIÓN DE PAVIMENTACIÓN CON CARPETA ASFÁLTICA DE LA CALLE INSURGENTES, EN EL TRAMO COMPRENDIDO DE CALLE LIBERTAD HASTA CALLE 20 DE NOVIEMBRE, DEL CADENAMIENTO 0+000 AL 0+624, DELEGACIÓN CALIXTLAHUACA, TOLUCA.",
    "delegacion": "CALIXTLAHUACA",
    "metrosLineales": 540.0,
    "superficieM2": 4685.4,
    "estatusPdf": "EN PROCESO",
    "contratoKey": "MT/DGOP/FEFOM/LPN-116/2026",
    "lpnNum": 116,
    "dragonId": null,
    "gidemId": null,
    "hasPhotosExpected": true,
    "fallbackCoords": [
      [
        19.337012,
        -99.683657
      ],
      [
        19.333295,
        -99.683333
      ],
      [
        19.332809,
        -99.683433
      ],
      [
        19.332025,
        -99.683469
      ]
    ]
  },
  {
    "stepIndex": 21,
    "bloque": 2,
    "bloqueNombre": "Rehabilitación de Pavimento",
    "numeroEnBloque": 2,
    "totalEnBloque": 39,
    "tipoObraPdf": "REHABILITACIÓN DE PAVIMENTO",
    "calle": "LIBERTAD",
    "descripcionPdf": "RECONSTRUCCIÓN DE PAVIMENTACIÓN CON CARPETA ASFÁLTICA DE LA CALLE LIBERTAD, EN EL TRAMO COMPRENDIDO DE CALLE ACTA DE INDEPENDENCIA HASTA CALLE BENITO JUÁREZ, DEL CADENAMIENTO 0+000 AL 0+624, DELEGACIÓN CALIXTLAHUACA, TOLUCA.",
    "delegacion": "CALIXTLAHUACA",
    "metrosLineales": 624.0,
    "superficieM2": 5053.25,
    "estatusPdf": "EN PROCESO",
    "contratoKey": "MT/DGOP/FEFOM/LPN-112/2026",
    "lpnNum": 112,
    "dragonId": null,
    "gidemId": null,
    "hasPhotosExpected": true,
    "fallbackCoords": [
      [
        19.33645,
        -99.689493
      ],
      [
        19.336964,
        -99.683654
      ]
    ]
  },
  {
    "stepIndex": 22,
    "bloque": 2,
    "bloqueNombre": "Rehabilitación de Pavimento",
    "numeroEnBloque": 3,
    "totalEnBloque": 39,
    "tipoObraPdf": "REHABILITACIÓN DE PAVIMENTO",
    "calle": "ADOLFO LÓPEZ MATEOS",
    "descripcionPdf": "REHABILITACIÓN DE PAVIMENTACIÓN CON CARPETA ASFÁLTICA DE LA CALLE ADOLFO LÓPEZ MATEOS, EN EL TRAMO COMPRENDIDO DE CALLE ACTA DE INDEPENDENCIA HASTA CALLE NICOLÁS BRAVO, DEL CADENAMIENTO 0+000 AL 0+100, DELEGACIÓN CALIXTLAHUACA, TOLUCA.",
    "delegacion": "CALIXTLAHUACA",
    "metrosLineales": 100.0,
    "superficieM2": 791.9,
    "estatusPdf": "EN PROCESO",
    "contratoKey": "MT/DGOP/FEFOM/LPN-108/2026",
    "lpnNum": 108,
    "dragonId": null,
    "gidemId": null,
    "hasPhotosExpected": true,
    "fallbackCoords": [
      [
        19.334326,
        -99.685769
      ],
      [
        19.33441,
        -99.684812
      ]
    ]
  },
  {
    "stepIndex": 23,
    "bloque": 2,
    "bloqueNombre": "Rehabilitación de Pavimento",
    "numeroEnBloque": 4,
    "totalEnBloque": 39,
    "tipoObraPdf": "REHABILITACIÓN DE PAVIMENTO",
    "calle": "ANTONIO ALBARRÁN",
    "descripcionPdf": "REHABILITACIÓN DE PAVIMENTACIÓN CON CARPETA ASFÁLTICA DE LA CALLE ANTONIO ALBARRÁN, EN EL TRAMO COMPRENDIDO DE CALLE GENERAL ABELARDO RODRÍGUEZ HASTA CALLE LA VESANA, DEL CADENAMIENTO 0+000 AL 0+717, DELEGACIÓN CAPULTITLÁN, TOLUCA.",
    "delegacion": "CAPULTITLÁN",
    "metrosLineales": 717.0,
    "superficieM2": 6862.0,
    "estatusPdf": "EN PROCESO",
    "contratoKey": "MT/DGOP/FEFOM/LPN-109/2026",
    "lpnNum": 109,
    "dragonId": null,
    "gidemId": null,
    "hasPhotosExpected": true,
    "fallbackCoords": [
      [
        19.260389,
        -99.649715
      ],
      [
        19.253766,
        -99.650202
      ]
    ]
  },
  {
    "stepIndex": 24,
    "bloque": 2,
    "bloqueNombre": "Rehabilitación de Pavimento",
    "numeroEnBloque": 5,
    "totalEnBloque": 39,
    "tipoObraPdf": "REHABILITACIÓN DE PAVIMENTO",
    "calle": "LEONA VICARIO",
    "descripcionPdf": "REHABILITACIÓN DE PAVIMENTACIÓN CON CARPETA ASFÁLTICA DE LA CALLE LEONA VICARIO, EN EL TRAMO COMPRENDIDO ENTRE AVENIDA MIGUEL HIDALGO Y AVENIDA SEBASTIÁN LERDO DE TEJADA, DELEGACIÓN CENTRO HISTÓRICO, MUNICIPIO DE TOLUCA.",
    "delegacion": "CENTRO HISTÓRICO",
    "metrosLineales": 389.17,
    "superficieM2": 3027.32,
    "estatusPdf": "TERMINADA",
    "contratoKey": "MT/DGOP/FAISMUN/LPN-081/2026",
    "lpnNum": 81,
    "dragonId": null,
    "gidemId": null,
    "hasPhotosExpected": true,
    "fallbackCoords": [
      [
        19.290029,
        -99.645914
      ],
      [
        19.293499,
        -99.64598
      ]
    ]
  },
  {
    "stepIndex": 25,
    "bloque": 2,
    "bloqueNombre": "Rehabilitación de Pavimento",
    "numeroEnBloque": 6,
    "totalEnBloque": 39,
    "tipoObraPdf": "REHABILITACIÓN DE PAVIMENTO",
    "calle": "ALEJANDRO VON HUMBOLDT, 2ª ETAPA",
    "descripcionPdf": "REHABILITACIÓN DE PAVIMENTACIÓN CON CARPETA ASFÁLTICA EN LA CALLE ALEJANDRO VON HUMBOLDT, 2ª ETAPA, DEL TRAMO COMPRENDIDO ENTRE CALLE MIGUEL HIDALGO Y CALLE INDEPENDENCIA, DELEGACIÓN CENTRO HISTÓRICO, MUNICIPIO DE TOLUCA.",
    "delegacion": "CENTRO HISTÓRICO",
    "metrosLineales": 237.45,
    "superficieM2": 2118.5,
    "estatusPdf": "TERMINADA",
    "contratoKey": "MT/DGOP/FAISMUN/LPN-083/2026",
    "lpnNum": 83,
    "dragonId": null,
    "gidemId": null,
    "hasPhotosExpected": true,
    "fallbackCoords": [
      [
        19.292129,
        -99.64877
      ],
      [
        19.290027,
        -99.648672
      ]
    ]
  },
  {
    "stepIndex": 26,
    "bloque": 2,
    "bloqueNombre": "Rehabilitación de Pavimento",
    "numeroEnBloque": 7,
    "totalEnBloque": 39,
    "tipoObraPdf": "REHABILITACIÓN DE PAVIMENTO",
    "calle": "MELCHOR OCAMPO",
    "descripcionPdf": "REHABILITACIÓN DE PAVIMENTACIÓN CON CARPETA ASFÁLTICA EN LA CALLE MELCHOR OCAMPO, EN EL TRAMO COMPRENDIDO DE AVENIDA JOSÉ MARÍA MORELOS Y PAVÓN Y CALLE PLUTARCO GONZÁLEZ, DELEGACIÓN CENTRO HISTÓRICO, MUNICIPIO DE TOLUCA.",
    "delegacion": "CENTRO HISTÓRICO",
    "metrosLineales": 137.5,
    "superficieM2": 826.0,
    "estatusPdf": "TERMINADA",
    "contratoKey": "MT/DGOP/FAISMUN/LPN-089/2026",
    "lpnNum": 89,
    "dragonId": null,
    "gidemId": null,
    "hasPhotosExpected": true,
    "fallbackCoords": [
      [
        19.289147,
        -99.66129
      ],
      [
        19.287922,
        -99.661464
      ]
    ]
  },
  {
    "stepIndex": 27,
    "bloque": 2,
    "bloqueNombre": "Rehabilitación de Pavimento",
    "numeroEnBloque": 8,
    "totalEnBloque": 39,
    "tipoObraPdf": "REHABILITACIÓN DE PAVIMENTO",
    "calle": "RINCONADA DE PINO SUÁREZ",
    "descripcionPdf": "REHABILITACIÓN DE PAVIMENTACIÓN CON CARPETA ASFÁLTICA EN LA CALLE RINCONADA DE PINO SUÁREZ, DEL TRAMO COMPRENDIDO ENTRE EL BOULEVARD JOSÉ MARÍA PINO SUÁREZ Y LA CALLE INSTITUTO LITERARIO, DELEGACIÓN CENTRO HISTÓRICO, MUNICIPIO DE TOLUCA.",
    "delegacion": "CENTRO HISTÓRICO",
    "metrosLineales": 261.21,
    "superficieM2": 2352.85,
    "estatusPdf": "TERMINADA",
    "contratoKey": "MT/DGOP/IPDM/LPN-054/2026",
    "lpnNum": 54,
    "dragonId": null,
    "gidemId": null,
    "hasPhotosExpected": true,
    "fallbackCoords": [
      [
        19.287412,
        -99.649812
      ],
      [
        19.287379,
        -99.649347
      ],
      [
        19.286775,
        -99.64932
      ],
      [
        19.286756,
        -99.648699
      ],
      [
        19.286264,
        -99.648648
      ]
    ]
  },
  {
    "stepIndex": 28,
    "bloque": 2,
    "bloqueNombre": "Rehabilitación de Pavimento",
    "numeroEnBloque": 9,
    "totalEnBloque": 39,
    "tipoObraPdf": "REHABILITACIÓN DE PAVIMENTO (SLURRY)",
    "calle": "SOR JUANA INÉS DE LA CRUZ",
    "descripcionPdf": "REHABILITACIÓN DE PAVIMENTACIÓN DE CARPETA ASFÁLTICA A TRAVÉS DE SLURRY EN LA CALLE SOR JUANA INÉS DE LA CRUZ, DEL TRAMO COMPRENDIDO ENTRE AVENIDA MORELOS Y CALLE SANTOS DEGOLLADO, DELEGACIÓN CENTRO HISTÓRICO, MUNICIPIO DE TOLUCA.",
    "delegacion": "CENTRO HISTÓRICO",
    "metrosLineales": 633.42,
    "superficieM2": 5684.15,
    "estatusPdf": "TERMINADA",
    "contratoKey": "MT/DGOP/FAISMUN/LPN-080/2026",
    "lpnNum": 80,
    "dragonId": null,
    "gidemId": null,
    "hasPhotosExpected": true,
    "fallbackCoords": [
      [
        19.288227,
        -99.651482
      ],
      [
        19.289,
        -99.651469
      ],
      [
        19.289149,
        -99.651536
      ],
      [
        19.289912,
        -99.651534
      ],
      [
        19.291819,
        -99.651556
      ],
      [
        19.292172,
        -99.651592
      ],
      [
        19.293598,
        -99.651619
      ],
      [
        19.29388,
        -99.651622
      ]
    ]
  },
  {
    "stepIndex": 29,
    "bloque": 2,
    "bloqueNombre": "Rehabilitación de Pavimento",
    "numeroEnBloque": 10,
    "totalEnBloque": 39,
    "tipoObraPdf": "REHABILITACIÓN DE PAVIMENTO (SLURRY)",
    "calle": "IGNACIO LÓPEZ RAYÓN (CENTRO)",
    "descripcionPdf": "REHABILITACIÓN DE PAVIMENTACIÓN DE CARPETA ASFÁLTICA A TRAVÉS DE SLURRY EN LA CALLE IGNACIO LÓPEZ RAYÓN, EN EL TRAMO COMPRENDIDO ENTRE CALLE VALENTÍN GÓMEZ FARÍAS Y CALLE SANTOS DEGOLLADO, DELEGACIÓN CENTRO HISTÓRICO, MUNICIPIO DE TOLUCA.",
    "delegacion": "CENTRO HISTÓRICO",
    "metrosLineales": 939.26,
    "superficieM2": 8138.27,
    "estatusPdf": "TERMINADA",
    "contratoKey": "MT/DGOP/FAISMUN/LPN-085/2026",
    "lpnNum": 85,
    "dragonId": null,
    "gidemId": null,
    "hasPhotosExpected": true,
    "fallbackCoords": [
      [
        19.285392,
        -99.652769
      ],
      [
        19.286226,
        -99.652807
      ],
      [
        19.290035,
        -99.652901
      ],
      [
        19.293246,
        -99.65294
      ],
      [
        19.293892,
        -99.653012
      ]
    ]
  },
  {
    "stepIndex": 30,
    "bloque": 2,
    "bloqueNombre": "Rehabilitación de Pavimento",
    "numeroEnBloque": 11,
    "totalEnBloque": 39,
    "tipoObraPdf": "REHABILITACIÓN DE PAVIMENTO (SLURRY)",
    "calle": "FELIPE VILLANUEVA",
    "descripcionPdf": "REHABILITACIÓN DE PAVIMENTACIÓN CON CARPETA ASFÁLTICA A TRAVÉS DE SLURRY EN LA CALLE FELIPE VILLANUEVA, DEL TRAMO COMPRENDIDO ENTRE AVENIDA JOSÉ MARÍA MORELOS Y PAVÓN Y AVENIDA SEBASTIÁN LERDO DE TEJADA, DELEGACIÓN CIUDAD UNIVERSITARIA, MUNICIPIO DE TOLUCA.",
    "delegacion": "CIUDAD UNIVERSITARIA",
    "metrosLineales": 397.96,
    "superficieM2": 3549.75,
    "estatusPdf": "TERMINADA",
    "contratoKey": "MT/DGOP/FAISMUN/LPN-079/2026",
    "lpnNum": 79,
    "dragonId": null,
    "gidemId": null,
    "hasPhotosExpected": true,
    "fallbackCoords": [
      [
        19.287919,
        -99.665573
      ],
      [
        19.289757,
        -99.665595
      ],
      [
        19.290891,
        -99.665638
      ],
      [
        19.291439,
        -99.665664
      ]
    ]
  },
  {
    "stepIndex": 31,
    "bloque": 2,
    "bloqueNombre": "Rehabilitación de Pavimento",
    "numeroEnBloque": 12,
    "totalEnBloque": 39,
    "tipoObraPdf": "REHABILITACIÓN DE PAVIMENTO",
    "calle": "AURELIO VENEGAS",
    "descripcionPdf": "REHABILITACIÓN DE PAVIMENTACIÓN CON CARPETA ASFÁLTICA EN LA CALLE AURELIO VENEGAS, DEL TRAMO COMPRENDIDO ENTRE AV. SEBASTIÁN LERDO DE TEJADA Y AV. JOSÉ MARÍA MORELOS Y PAVÓN, DELEGACIÓN CIUDAD UNIVERSITARIA, MUNICIPIO DE TOLUCA.",
    "delegacion": "CIUDAD UNIVERSITARIA",
    "metrosLineales": 346.57,
    "superficieM2": 3181.0,
    "estatusPdf": "TERMINADA",
    "contratoKey": "MT/DGOP/FAISMUN/LPN-084/2026",
    "lpnNum": 84,
    "dragonId": null,
    "gidemId": null,
    "hasPhotosExpected": true,
    "fallbackCoords": [
      [
        19.287909,
        -99.667564
      ],
      [
        19.289603,
        -99.667716
      ],
      [
        19.290943,
        -99.667805
      ]
    ]
  },
  {
    "stepIndex": 32,
    "bloque": 2,
    "bloqueNombre": "Rehabilitación de Pavimento",
    "numeroEnBloque": 13,
    "totalEnBloque": 39,
    "tipoObraPdf": "REHABILITACIÓN DE PAVIMENTO",
    "calle": "CEBORUCO",
    "descripcionPdf": "REHABILITACIÓN DE PAVIMENTACIÓN CON CARPETA ASFÁLTICA DE LA CALLE CEBORUCO, EN EL TRAMO COMPRENDIDO DE CALLE ANTONIO ALBARRÁN HASTA AVENIDA PROFESOR HERIBERTO ENRÍQUEZ, DEL CADENAMIENTO 0+000 AL 0+607, DELEGACIÓN DEL PARQUE, TOLUCA.",
    "delegacion": "DEL PARQUE",
    "metrosLineales": 607.0,
    "superficieM2": 7441.7,
    "estatusPdf": "EN PROCESO",
    "contratoKey": "MT/DGOP/FEFOM/LPN-110/2026",
    "lpnNum": 110,
    "dragonId": null,
    "gidemId": null,
    "hasPhotosExpected": true,
    "fallbackCoords": [
      [
        19.260334,
        -99.649657
      ],
      [
        19.260267,
        -99.643878
      ]
    ]
  },
  {
    "stepIndex": 33,
    "bloque": 2,
    "bloqueNombre": "Rehabilitación de Pavimento",
    "numeroEnBloque": 14,
    "totalEnBloque": 39,
    "tipoObraPdf": "REHABILITACIÓN DE PAVIMENTO",
    "calle": "FELIPE PESCADOR",
    "descripcionPdf": "REHABILITACIÓN DE PAVIMENTACIÓN CON CARPETA ASFÁLTICA DE LA CALLE FELIPE PESCADOR, EN EL TRAMO COMPRENDIDO ENTRE CALLE MAXIMILIANO ÁLVAREZ Y CALLE ALBERTO GARCÍA, DELEGACIÓN INDEPENDENCIA, MUNICIPIO DE TOLUCA.",
    "delegacion": "INDEPENDENCIA",
    "metrosLineales": 101.07,
    "superficieM2": 1029.1,
    "estatusPdf": "TERMINADA",
    "contratoKey": "MT/DGOP/FAISMUN/LPN-082/2026",
    "lpnNum": 82,
    "dragonId": null,
    "gidemId": null,
    "hasPhotosExpected": true,
    "fallbackCoords": [
      [
        19.297077,
        -99.640124
      ],
      [
        19.297043,
        -99.641071
      ]
    ]
  },
  {
    "stepIndex": 34,
    "bloque": 2,
    "bloqueNombre": "Rehabilitación de Pavimento",
    "numeroEnBloque": 15,
    "totalEnBloque": 39,
    "tipoObraPdf": "REHABILITACIÓN DE PAVIMENTO",
    "calle": "MANUEL BUENDÍA TÉLLEZ GIRÓN (LA MAQUINITA)",
    "descripcionPdf": "REHABILITACIÓN DE PAVIMENTACIÓN CON CARPETA ASFÁLTICA DE LA CALLE MANUEL BUENDÍA TÉLLEZ GIRÓN, EN EL TRAMO COMPRENDIDO DE BOULEVARD ISIDRO FABELA HASTA AVENIDA ALFREDO DEL MAZO, DELEGACIÓN LA MAQUINITA, MUNICIPIO DE TOLUCA.",
    "delegacion": "LA MAQUINITA",
    "metrosLineales": 643.9,
    "superficieM2": 5112.1,
    "estatusPdf": "EN LICITACIÓN",
    "contratoKey": null,
    "lpnNum": null,
    "dragonId": null,
    "gidemId": null,
    "hasPhotosExpected": false,
    "fallbackCoords": [
      [
        19.31065,
        -99.63985
      ],
      [
        19.31255,
        -99.63395
      ]
    ]
  },
  {
    "stepIndex": 35,
    "bloque": 2,
    "bloqueNombre": "Rehabilitación de Pavimento",
    "numeroEnBloque": 16,
    "totalEnBloque": 39,
    "tipoObraPdf": "REHABILITACIÓN DE PAVIMENTO",
    "calle": "AVENIDA DEL TRABAJO",
    "descripcionPdf": "REHABILITACIÓN DE PAVIMENTACIÓN CON CARPETA ASFÁLTICA EN LA AVENIDA DEL TRABAJO, DEL TRAMO COMPRENDIDO ENTRE 1RO DE MAYO Y CALLE MANUEL BUENDÍA TÉLLEZ GIRÓN, DELEGACIÓN LA MAQUINITA, MUNICIPIO DE TOLUCA.",
    "delegacion": "LA MAQUINITA",
    "metrosLineales": 518.2,
    "superficieM2": 5720.5,
    "estatusPdf": "EN AUTORIZACIÓN (FAISMUN)",
    "contratoKey": "MT/DGOP/IFAISMUN/LPN-052/2026",
    "lpnNum": 52,
    "dragonId": null,
    "gidemId": null,
    "hasPhotosExpected": true,
    "fallbackCoords": [
      [
        19.311262,
        -99.639853
      ],
      [
        19.311231,
        -99.642231
      ],
      [
        19.311209,
        -99.642408
      ],
      [
        19.31117,
        -99.645522
      ]
    ]
  },
  {
    "stepIndex": 36,
    "bloque": 2,
    "bloqueNombre": "Rehabilitación de Pavimento",
    "numeroEnBloque": 17,
    "totalEnBloque": 39,
    "tipoObraPdf": "REHABILITACIÓN DE PAVIMENTO",
    "calle": "GRAL. ABELARDO RODRÍGUEZ",
    "descripcionPdf": "REHABILITACIÓN DE PAVIMENTACIÓN CON CARPETA ASFÁLTICA DE LA CALLE GRAL. ABELARDO RODRÍGUEZ, EN EL TRAMO COMPRENDIDO DE PASEO COLÓN A CALLE JESÚS CARRANZA, DEL CADENAMIENTO 0+000 AL 0+260, DELEGACIÓN MODERNA DE LA CRUZ, MUNICIPIO DE TOLUCA.",
    "delegacion": "MODERNA DE LA CRUZ",
    "metrosLineales": 260.0,
    "superficieM2": 2080.0,
    "estatusPdf": "EN AUTORIZACIÓN (GIDEM)",
    "contratoKey": null,
    "lpnNum": null,
    "dragonId": null,
    "gidemId": 1,
    "hasPhotosExpected": false,
    "fallbackCoords": [
      [
        19.260978,
        -99.659481
      ],
      [
        19.261242,
        -99.662102
      ]
    ]
  },
  {
    "stepIndex": 37,
    "bloque": 2,
    "bloqueNombre": "Rehabilitación de Pavimento",
    "numeroEnBloque": 18,
    "totalEnBloque": 39,
    "tipoObraPdf": "REHABILITACIÓN DE PAVIMENTO",
    "calle": "MIGUEL HIDALGO Y COSTILLA",
    "descripcionPdf": "RECONSTRUCCIÓN DE PAVIMENTACIÓN CON CARPETA ASFÁLTICA DE LA CALLE MIGUEL HIDALGO Y COSTILLA, EN EL TRAMO COMPRENDIDO DE CALLE PRIMERO DE MAYO A CALLE EMILIANO ZAPATA, DELEGACIÓN SAN ANDRÉS CUEXCONTITLÁN, DEL CADENAMIENTO 0+000 AL 0+853.35, MUNICIPIO DE TOLUCA.",
    "delegacion": "SAN ANDRÉS CUEXCONTITLÁN",
    "metrosLineales": 853.35,
    "superficieM2": 8533.5,
    "estatusPdf": "EN AUTORIZACIÓN (GIDEM)",
    "contratoKey": null,
    "lpnNum": null,
    "dragonId": null,
    "gidemId": 3,
    "hasPhotosExpected": false,
    "fallbackCoords": [
      [
        19.355733,
        -99.624477
      ],
      [
        19.355976,
        -99.619778
      ],
      [
        19.355631,
        -99.618176
      ],
      [
        19.354971,
        -99.616541
      ]
    ]
  },
  {
    "stepIndex": 38,
    "bloque": 2,
    "bloqueNombre": "Rehabilitación de Pavimento",
    "numeroEnBloque": 19,
    "totalEnBloque": 39,
    "tipoObraPdf": "REHABILITACIÓN DE PAVIMENTO",
    "calle": "EMILIANO ZAPATA",
    "descripcionPdf": "RECONSTRUCCIÓN DE PAVIMENTACIÓN CON CARPETA ASFÁLTICA DE LA CALLE EMILIANO ZAPATA, EN EL TRAMO COMPRENDIDO DE CALLE MIGUEL HIDALGO Y COSTILLA A CALLE TULTEPEC, DEL CADENAMIENTO 0+000 AL 0+694, DELEGACIÓN SAN ANDRÉS CUEXCONTITLÁN, MUNICIPIO DE TOLUCA.",
    "delegacion": "SAN ANDRÉS CUEXCONTITLÁN",
    "metrosLineales": 694.0,
    "superficieM2": 5552.0,
    "estatusPdf": "EN AUTORIZACIÓN (GIDEM)",
    "contratoKey": null,
    "lpnNum": null,
    "dragonId": null,
    "gidemId": 8,
    "hasPhotosExpected": false,
    "fallbackCoords": [
      [
        19.360208,
        -99.613533
      ],
      [
        19.354983,
        -99.616473
      ]
    ]
  },
  {
    "stepIndex": 39,
    "bloque": 2,
    "bloqueNombre": "Rehabilitación de Pavimento",
    "numeroEnBloque": 20,
    "totalEnBloque": 39,
    "tipoObraPdf": "REHABILITACIÓN DE PAVIMENTO",
    "calle": "TULTEPEC",
    "descripcionPdf": "RECONSTRUCCIÓN DE PAVIMENTACIÓN CON CONCRETO HIDRÁULICO, GUARNICIONES Y BANQUETAS, EN LA CALLE TULTEPEC, EN EL TRAMO COMPRENDIDO DE CALLE EMILIANO ZAPATA A CALLE GRAL. JOSÉ VICENTE VILLADA, DEL CADENAMIENTO 0+000 AL 0+435, DELEGACIÓN SAN ANDRÉS CUEXCONTITLÁN.",
    "delegacion": "SAN ANDRÉS CUEXCONTITLÁN",
    "metrosLineales": 435.0,
    "superficieM2": 4350.0,
    "estatusPdf": "EN AUTORIZACIÓN (GIDEM)",
    "contratoKey": null,
    "lpnNum": null,
    "dragonId": null,
    "gidemId": 12,
    "hasPhotosExpected": false,
    "fallbackCoords": [
      [
        19.360262,
        -99.613515
      ],
      [
        19.358616,
        -99.609737
      ]
    ]
  },
  {
    "stepIndex": 40,
    "bloque": 2,
    "bloqueNombre": "Rehabilitación de Pavimento",
    "numeroEnBloque": 21,
    "totalEnBloque": 39,
    "tipoObraPdf": "REHABILITACIÓN DE PAVIMENTO (SLURRY)",
    "calle": "ALPINISMO",
    "descripcionPdf": "REHABILITACIÓN DE PAVIMENTACIÓN DE CARPETA ASFÁLTICA A TRAVÉS DE SLURRY EN LA CALLE ALPINISMO, DEL TRAMO COMPRENDIDO ENTRE CALLE VENUSTIANO CARRANZA Y AVENIDA AL PACÍFICO, DELEGACIÓN SAN BUENAVENTURA, MUNICIPIO DE TOLUCA.",
    "delegacion": "SAN BUENAVENTURA",
    "metrosLineales": 3157.0,
    "superficieM2": 31223.0,
    "estatusPdf": "EN PROCESO",
    "contratoKey": "MT/DGOP/IPDM/LPN-055/2026",
    "lpnNum": 55,
    "dragonId": null,
    "gidemId": null,
    "hasPhotosExpected": true,
    "fallbackCoords": [
      [
        19.273101,
        -99.68541
      ],
      [
        19.266938,
        -99.689249
      ],
      [
        19.260761,
        -99.693188
      ],
      [
        19.256784,
        -99.695643
      ]
    ]
  },
  {
    "stepIndex": 41,
    "bloque": 2,
    "bloqueNombre": "Rehabilitación de Pavimento",
    "numeroEnBloque": 22,
    "totalEnBloque": 39,
    "tipoObraPdf": "REHABILITACIÓN DE PAVIMENTO",
    "calle": "MANUEL BUENDÍA TÉLLEZ GIRÓN (HUICHOCHITLÁN)",
    "descripcionPdf": "REHABILITACIÓN DE PAVIMENTACIÓN CON CARPETA ASFÁLTICA DE LA CALLE MANUEL BUENDÍA TÉLLEZ GIRÓN, EN EL TRAMO COMPRENDIDO DE CONCRETO HIDRÁULICO EXISTENTE A CALLE GUADALUPE VICTORIA, CADENAMIENTO 0+000 AL 3+717, SAN CRISTÓBAL HUICHOCHITLÁN.",
    "delegacion": "SAN CRISTÓBAL HUICHOCHITLÁN",
    "metrosLineales": 3717.0,
    "superficieM2": 0.0,
    "estatusPdf": "EN AUTORIZACIÓN (GIDEM)",
    "contratoKey": null,
    "lpnNum": null,
    "dragonId": null,
    "gidemId": 9,
    "hasPhotosExpected": false,
    "fallbackCoords": [
      [
        19.330798,
        -99.642424
      ],
      [
        19.332919,
        -99.641799
      ],
      [
        19.334796,
        -99.641752
      ],
      [
        19.336013,
        -99.64168
      ],
      [
        19.339098,
        -99.642218
      ],
      [
        19.340847,
        -99.642293
      ],
      [
        19.341322,
        -99.642792
      ],
      [
        19.343652,
        -99.643677
      ],
      [
        19.346622,
        -99.643851
      ],
      [
        19.353313,
        -99.643327
      ],
      [
        19.356772,
        -99.643474
      ],
      [
        19.358693,
        -99.643816
      ],
      [
        19.360836,
        -99.644613
      ],
      [
        19.363489,
        -99.644968
      ],
      [
        19.363779,
        -99.64514
      ]
    ]
  },
  {
    "stepIndex": 42,
    "bloque": 2,
    "bloqueNombre": "Rehabilitación de Pavimento",
    "numeroEnBloque": 23,
    "totalEnBloque": 39,
    "tipoObraPdf": "REHABILITACIÓN DE PAVIMENTO",
    "calle": "MEXTLI",
    "descripcionPdf": "REHABILITACIÓN DE PAVIMENTACIÓN CON CARPETA ASFÁLTICA DE LA CALLE MEXTLI, EN EL TRAMO COMPRENDIDO DE CALLE ANTONIO ALBARRÁN HASTA AVENIDA PROFESOR HERIBERTO ENRÍQUEZ, DEL CADENAMIENTO 0+000 AL 0+706, DELEGACIÓN SAN FELIPE TLALMIMILOLPAN, TOLUCA.",
    "delegacion": "SAN FELIPE TLALMIMILOLPAN",
    "metrosLineales": 706.0,
    "superficieM2": 6372.38,
    "estatusPdf": "EN PROCESO",
    "contratoKey": "MT/DGOP/FEFOM/LPN-111/2026",
    "lpnNum": 111,
    "dragonId": null,
    "gidemId": null,
    "hasPhotosExpected": true,
    "fallbackCoords": [
      [
        19.258115,
        -99.64985
      ],
      [
        19.257971,
        -99.643131
      ]
    ]
  },
  {
    "stepIndex": 43,
    "bloque": 2,
    "bloqueNombre": "Rehabilitación de Pavimento",
    "numeroEnBloque": 24,
    "totalEnBloque": 39,
    "tipoObraPdf": "REHABILITACIÓN DE PAVIMENTO",
    "calle": "CAMINO A SAN JUAN TILAPA",
    "descripcionPdf": "REHABILITACIÓN DE PAVIMENTACIÓN CON CARPETA ASFÁLTICA EN EL CAMINO A SAN JUAN TILAPA, DEL TRAMO COMPRENDIDO ENTRE SAN FELIPE TLALMIMILOLPAN Y CALLE DE LA CRUZ, MUNICIPIO DE TOLUCA.",
    "delegacion": "SAN FELIPE TLALMIMILOLPAN",
    "metrosLineales": 1802.81,
    "superficieM2": 13379.0,
    "estatusPdf": "EN PROCESO",
    "contratoKey": "MT/DGOP/FAISMUN/LPN-091/2026",
    "lpnNum": 91,
    "dragonId": null,
    "gidemId": null,
    "hasPhotosExpected": true,
    "fallbackCoords": [
      [
        19.223203,
        -99.656517
      ],
      [
        19.226684,
        -99.652311
      ],
      [
        19.228838,
        -99.65054
      ],
      [
        19.232228,
        -99.647755
      ],
      [
        19.233172,
        -99.647075
      ]
    ]
  },
  {
    "stepIndex": 44,
    "bloque": 2,
    "bloqueNombre": "Rehabilitación de Pavimento",
    "numeroEnBloque": 25,
    "totalEnBloque": 39,
    "tipoObraPdf": "REHABILITACIÓN DE PAVIMENTO",
    "calle": "18 DE MARZO",
    "descripcionPdf": "RECONSTRUCCIÓN DE PAVIMENTACIÓN DE CARPETA ASFÁLTICA DE LA CALLE 18 DE MARZO EN EL TRAMO COMPRENDIDO DE CALLE 5 DE MAYO HASTA PASEO TOLTEPEC, DEL CADENAMIENTO 0+000 AL 0+140, DELEGACIÓN SAN MARTÍN TOLTEPEC, TOLUCA.",
    "delegacion": "SAN MARTÍN TOLTEPEC",
    "metrosLineales": 140.0,
    "superficieM2": 1150.0,
    "estatusPdf": "EN PROCESO",
    "contratoKey": "MT/DGOP/FEFOM/LPN-114/2026",
    "lpnNum": 114,
    "dragonId": null,
    "gidemId": null,
    "hasPhotosExpected": true,
    "fallbackCoords": [
      [
        19.351014,
        -99.705483
      ],
      [
        19.351868,
        -99.705858
      ],
      [
        19.352047,
        -99.705869
      ]
    ]
  },
  {
    "stepIndex": 45,
    "bloque": 2,
    "bloqueNombre": "Rehabilitación de Pavimento",
    "numeroEnBloque": 26,
    "totalEnBloque": 39,
    "tipoObraPdf": "REHABILITACIÓN DE PAVIMENTO",
    "calle": "AV. VICENTE LOMBARDO TOLEDANO, 1ª ETAPA",
    "descripcionPdf": "REHABILITACIÓN DE PAVIMENTACIÓN CON CARPETA ASFÁLTICA EN LA AVENIDA VICENTE LOMBARDO TOLEDANO, 1ª ETAPA, DEL TRAMO COMPRENDIDO ENTRE CALLE REVOLUCIÓN Y CALLE INDEPENDENCIA, DELEGACIÓN SAN MATEO OTZACATIPAN, MUNICIPIO DE TOLUCA.",
    "delegacion": "SAN MATEO OTZACATIPAN",
    "metrosLineales": 1317.0,
    "superficieM2": 19755.0,
    "estatusPdf": "TERMINADA",
    "contratoKey": "MT/DGOP/FAISMUN/LPN-050/2026",
    "lpnNum": 50,
    "dragonId": null,
    "gidemId": null,
    "hasPhotosExpected": true,
    "fallbackCoords": [
      [
        19.3094,
        -99.583849
      ],
      [
        19.309358,
        -99.584112
      ],
      [
        19.309382,
        -99.584635
      ],
      [
        19.309113,
        -99.585771
      ],
      [
        19.308624,
        -99.589588
      ],
      [
        19.30845,
        -99.590815
      ]
    ]
  },
  {
    "stepIndex": 46,
    "bloque": 2,
    "bloqueNombre": "Rehabilitación de Pavimento",
    "numeroEnBloque": 27,
    "totalEnBloque": 39,
    "tipoObraPdf": "REHABILITACIÓN DE PAVIMENTO",
    "calle": "GUADALUPE VICTORIA",
    "descripcionPdf": "REHABILITACIÓN DE PAVIMENTACIÓN CON CARPETA ASFÁLTICA EN LA CALLE GUADALUPE VICTORIA, DEL TRAMO COMPRENDIDO ENTRE CALLE TOLUCA Y CALLE IGNACIO PICHARDO PAGAZA, SUBDELEGACIÓN JICALTEPEC AUTOPAN, MUNICIPIO DE TOLUCA.",
    "delegacion": "SAN PABLO AUTOPAN",
    "metrosLineales": 956.0,
    "superficieM2": 9993.89,
    "estatusPdf": "TERMINADA",
    "contratoKey": "MT/DGOP/IFAISMUN/LPN-051/2026",
    "lpnNum": 51,
    "dragonId": null,
    "gidemId": null,
    "hasPhotosExpected": true,
    "fallbackCoords": [
      [
        19.373254,
        -99.642267
      ],
      [
        19.373542,
        -99.642021
      ],
      [
        19.373864,
        -99.641385
      ],
      [
        19.375078,
        -99.640452
      ],
      [
        19.380626,
        -99.638116
      ]
    ]
  },
  {
    "stepIndex": 47,
    "bloque": 2,
    "bloqueNombre": "Rehabilitación de Pavimento",
    "numeroEnBloque": 28,
    "totalEnBloque": 39,
    "tipoObraPdf": "REHABILITACIÓN DE PAVIMENTO",
    "calle": "PROGRESO",
    "descripcionPdf": "RECONSTRUCCIÓN DE PAVIMENTACIÓN CON CARPETA ASFÁLTICA EN LA CALLE PROGRESO EN EL TRAMO COMPRENDIDO DE CALLE CENTENARIO SUR Y CJÓN. 5 DE FEBRERO, DEL CADENAMIENTO 0+000 AL 0+383, DELEGACIÓN SAN PEDRO TOTOLTEPEC, MUNICIPIO DE TOLUCA.",
    "delegacion": "SAN PEDRO TOTOLTEPEC",
    "metrosLineales": 383.0,
    "superficieM2": 3064.0,
    "estatusPdf": "EN AUTORIZACIÓN (GIDEM)",
    "contratoKey": null,
    "lpnNum": null,
    "dragonId": null,
    "gidemId": 5,
    "hasPhotosExpected": false,
    "fallbackCoords": [
      [
        19.310518,
        -99.575372
      ],
      [
        19.31046,
        -99.571745
      ]
    ]
  },
  {
    "stepIndex": 48,
    "bloque": 2,
    "bloqueNombre": "Rehabilitación de Pavimento",
    "numeroEnBloque": 29,
    "totalEnBloque": 39,
    "tipoObraPdf": "REHABILITACIÓN DE PAVIMENTO",
    "calle": "AGUSTÍN MILLÁN",
    "descripcionPdf": "REHABILITACIÓN DE PAVIMENTACIÓN CON CARPETA ASFÁLTICA DE LA CALLE AGUSTÍN MILLÁN EN EL TRAMO COMPRENDIDO ENTRE BOULEVARD MIGUEL ALEMÁN Y CALLE SAN ANTONIO, DELEGACIÓN SAN PEDRO TOTOLTEPEC, MUNICIPIO DE TOLUCA.",
    "delegacion": "SAN PEDRO TOTOLTEPEC",
    "metrosLineales": 558.01,
    "superficieM2": 4126.38,
    "estatusPdf": "TERMINADA",
    "contratoKey": "MT/DGOP/IPDM/LPN-056/2026",
    "lpnNum": 56,
    "dragonId": null,
    "gidemId": null,
    "hasPhotosExpected": true,
    "fallbackCoords": [
      [
        19.315315,
        -99.563876
      ],
      [
        19.314173,
        -99.566583
      ],
      [
        19.313943,
        -99.567227
      ],
      [
        19.313815,
        -99.567793
      ]
    ]
  },
  {
    "stepIndex": 49,
    "bloque": 2,
    "bloqueNombre": "Rehabilitación de Pavimento",
    "numeroEnBloque": 30,
    "totalEnBloque": 39,
    "tipoObraPdf": "REHABILITACIÓN DE PAVIMENTO",
    "calle": "REVOLUCIÓN",
    "descripcionPdf": "RECONSTRUCCIÓN DE PAVIMENTACIÓN CON CARPETA ASFÁLTICA DE LA CALLE REVOLUCIÓN, EN EL TRAMO COMPRENDIDO DE PASEO VICENTE LOMBARDO TOLEDANO HASTA CALLE PRIVADA TLATELOLCO, DEL CADENAMIENTO 0+000 AL 0+160, DELEGACIÓN SAN PEDRO TOTOLTEPEC, TOLUCA.",
    "delegacion": "SAN PEDRO TOTOLTEPEC",
    "metrosLineales": 100.0,
    "superficieM2": 1992.42,
    "estatusPdf": "EN PROCESO",
    "contratoKey": "MT/DGOP/FEFOM/LPN-106/2026",
    "lpnNum": 106,
    "dragonId": null,
    "gidemId": null,
    "hasPhotosExpected": true,
    "fallbackCoords": [
      [
        19.309044,
        -99.585906
      ],
      [
        19.309359,
        -99.584709
      ],
      [
        19.309383,
        -99.583946
      ],
      [
        19.309323,
        -99.583728
      ],
      [
        19.309282,
        -99.582877
      ]
    ]
  },
  {
    "stepIndex": 50,
    "bloque": 2,
    "bloqueNombre": "Rehabilitación de Pavimento",
    "numeroEnBloque": 31,
    "totalEnBloque": 39,
    "tipoObraPdf": "REHABILITACIÓN DE PAVIMENTO",
    "calle": "CERRADA FELIPE CHÁVEZ",
    "descripcionPdf": "REHABILITACIÓN DE PAVIMENTACIÓN CON CONCRETO HIDRÁULICO DE LA CALLE CERRADA FELIPE CHÁVEZ, EN EL TRAMO COMPRENDIDO DE CALLE CENTENARIO SUR HASTA CALLE 5 DE FEBRERO, DELEGACIÓN SAN PEDRO TOTOLTEPEC, MUNICIPIO DE TOLUCA.",
    "delegacion": "SAN PEDRO TOTOLTEPEC",
    "metrosLineales": 299.0,
    "superficieM2": 2428.45,
    "estatusPdf": "EN LICITACIÓN",
    "contratoKey": null,
    "lpnNum": null,
    "dragonId": null,
    "gidemId": null,
    "hasPhotosExpected": false,
    "fallbackCoords": [
      [
        19.3112,
        -99.5758
      ],
      [
        19.31135,
        -99.5731
      ]
    ]
  },
  {
    "stepIndex": 51,
    "bloque": 2,
    "bloqueNombre": "Rehabilitación de Pavimento",
    "numeroEnBloque": 32,
    "totalEnBloque": 39,
    "tipoObraPdf": "REHABILITACIÓN DE PAVIMENTO",
    "calle": "ISABEL LA CATÓLICA, 2ª ETAPA",
    "descripcionPdf": "REHABILITACIÓN DE PAVIMENTACIÓN CON CARPETA ASFÁLTICA EN LA CALLE ISABEL LA CATÓLICA, 2ª ETAPA, DEL TRAMO COMPRENDIDO ENTRE AV. JOSÉ MARÍA MORELOS Y PAVÓN Y CALLE NEZAHUALCÓYOTL, DELEGACIÓN SAN SEBASTIÁN, MUNICIPIO DE TOLUCA.",
    "delegacion": "SAN SEBASTIÁN",
    "metrosLineales": 330.56,
    "superficieM2": 2947.46,
    "estatusPdf": "TERMINADA",
    "contratoKey": "MT/DGOP/FAISMUN/LPN-078/2026",
    "lpnNum": 78,
    "dragonId": null,
    "gidemId": null,
    "hasPhotosExpected": true,
    "fallbackCoords": [
      [
        19.288101,
        -99.642957
      ],
      [
        19.285226,
        -99.642934
      ]
    ]
  },
  {
    "stepIndex": 52,
    "bloque": 2,
    "bloqueNombre": "Rehabilitación de Pavimento",
    "numeroEnBloque": 33,
    "totalEnBloque": 39,
    "tipoObraPdf": "REHABILITACIÓN DE PAVIMENTO",
    "calle": "FRANCISCO VILLA",
    "descripcionPdf": "REHABILITACIÓN DE PAVIMENTACIÓN CON CONCRETO HIDRÁULICO EN LA CALLE FRANCISCO VILLA, DEL TRAMO COMPRENDIDO ENTRE CALLE ROMÁN BADILLO Y PRIVADA DE FRANCISCO VILLA, DELEGACIÓN SANTA CRUZ ATZCAPOTZALTONGO, MUNICIPIO DE TOLUCA.",
    "delegacion": "SANTA CRUZ ATZCAPOTZALTONGO",
    "metrosLineales": 666.81,
    "superficieM2": 2912.86,
    "estatusPdf": "TERMINADA",
    "contratoKey": "MT/DGOP/IPDM/LPN-053/2026",
    "lpnNum": 53,
    "dragonId": null,
    "gidemId": null,
    "hasPhotosExpected": true,
    "fallbackCoords": [
      [
        19.31824,
        -99.644409
      ],
      [
        19.318343,
        -99.64714
      ],
      [
        19.317495,
        -99.64812
      ]
    ]
  },
  {
    "stepIndex": 53,
    "bloque": 2,
    "bloqueNombre": "Rehabilitación de Pavimento",
    "numeroEnBloque": 34,
    "totalEnBloque": 39,
    "tipoObraPdf": "REHABILITACIÓN DE PAVIMENTO",
    "calle": "REFORMA",
    "descripcionPdf": "RECONSTRUCCIÓN DE PAVIMENTACIÓN DE CARPETA ASFÁLTICA DE LA CALLE REFORMA, EN EL TRAMO COMPRENDIDO DE CALLE RÍO PAPALOAPAN HASTA CALLE JOSUÉ MIRLO, DEL CADENAMIENTO 0+000 AL 0+979, DELEGACIÓN SANTA CRUZ ATZCAPOTZALTONGO, TOLUCA.",
    "delegacion": "SANTA CRUZ ATZCAPOTZALTONGO",
    "metrosLineales": 979.0,
    "superficieM2": 6397.16,
    "estatusPdf": "EN PROCESO",
    "contratoKey": "MT/DGOP/FEFOM/LPN-113/2026",
    "lpnNum": 113,
    "dragonId": null,
    "gidemId": null,
    "hasPhotosExpected": true,
    "fallbackCoords": [
      [
        19.317117,
        -99.656298
      ],
      [
        19.308243,
        -99.656913
      ]
    ]
  },
  {
    "stepIndex": 54,
    "bloque": 2,
    "bloqueNombre": "Rehabilitación de Pavimento",
    "numeroEnBloque": 35,
    "totalEnBloque": 39,
    "tipoObraPdf": "REHABILITACIÓN DE PAVIMENTO",
    "calle": "IGNACIO LÓPEZ RAYÓN 2ª ETAPA (MILTEPEC)",
    "descripcionPdf": "REHABILITACIÓN DE PAVIMENTACIÓN CON CARPETA ASFÁLTICA DE LA CALLE IGNACIO LÓPEZ RAYÓN 2ª ETAPA, EN EL TRAMO COMPRENDIDO DESDE LA CARRETERA TOLUCA-IXTLAHUACA Y CALLE JOSÉ MARÍA ARTEAGA, DELEGACIÓN SANTIAGO MILTEPEC, MUNICIPIO DE TOLUCA.",
    "delegacion": "SANTIAGO MILTEPEC",
    "metrosLineales": 1865.68,
    "superficieM2": 16230.0,
    "estatusPdf": "EN PROCESO",
    "contratoKey": "MT/DGOP/FAISMUN/LPN-090/2026",
    "lpnNum": 90,
    "dragonId": null,
    "gidemId": null,
    "hasPhotosExpected": true,
    "fallbackCoords": [
      [
        19.324185,
        -99.656789
      ],
      [
        19.327312,
        -99.656512
      ],
      [
        19.337551,
        -99.65676
      ],
      [
        19.340674,
        -99.656676
      ]
    ]
  },
  {
    "stepIndex": 55,
    "bloque": 2,
    "bloqueNombre": "Rehabilitación de Pavimento",
    "numeroEnBloque": 36,
    "totalEnBloque": 39,
    "tipoObraPdf": "REHABILITACIÓN DE PAVIMENTO",
    "calle": "CAMINO AL REFUGIO",
    "descripcionPdf": "REHABILITACIÓN DE PAVIMENTACIÓN CON CARPETA ASFÁLTICA EN EL CAMINO AL REFUGIO, DEL TRAMO COMPRENDIDO ENTRE CALLE JOSEFA ORTIZ DE DOMÍNGUEZ Y CALLE LOS CUERVOS, DELEGACIÓN SANTIAGO TLACOTEPEC, MUNICIPIO DE TOLUCA.",
    "delegacion": "SANTIAGO TLACOTEPEC",
    "metrosLineales": 1129.29,
    "superficieM2": 8591.45,
    "estatusPdf": "EN PROCESO",
    "contratoKey": "MT/DGOP/FAISMUN/LPN-058/2026",
    "lpnNum": 58,
    "dragonId": null,
    "gidemId": null,
    "hasPhotosExpected": true,
    "fallbackCoords": [
      [
        19.230523,
        -99.672665
      ],
      [
        19.231551,
        -99.674084
      ],
      [
        19.231508,
        -99.677196
      ],
      [
        19.233471,
        -99.681908
      ]
    ]
  },
  {
    "stepIndex": 56,
    "bloque": 2,
    "bloqueNombre": "Rehabilitación de Pavimento",
    "numeroEnBloque": 37,
    "totalEnBloque": 39,
    "tipoObraPdf": "REHABILITACIÓN DE PAVIMENTO",
    "calle": "AV. INSURGENTES (TLAXOMULCO)",
    "descripcionPdf": "REHABILITACIÓN DE PAVIMENTACIÓN CON CARPETA ASFÁLTICA EN LA AV. INSURGENTES, EN EL TRAMO COMPRENDIDO DE CALLE RÍO PAPALOAPAN Y CALLE DE LOS CIPRESES, DEL CADENAMIENTO 0+000 AL 1+511, DELEGACIÓN SANTIAGO TLAXOMULCO, MUNICIPIO DE TOLUCA.",
    "delegacion": "SANTIAGO TLAXOMULCO",
    "metrosLineales": 1511.0,
    "superficieM2": 13599.0,
    "estatusPdf": "EN AUTORIZACIÓN (GIDEM)",
    "contratoKey": null,
    "lpnNum": null,
    "dragonId": null,
    "gidemId": 4,
    "hasPhotosExpected": false,
    "fallbackCoords": [
      [
        19.308269,
        -99.670394
      ],
      [
        19.313278,
        -99.670446
      ],
      [
        19.315507,
        -99.669874
      ],
      [
        19.3173,
        -99.669819
      ],
      [
        19.317745,
        -99.669983
      ],
      [
        19.318436,
        -99.669758
      ],
      [
        19.319129,
        -99.668635
      ],
      [
        19.319236,
        -99.667271
      ],
      [
        19.319965,
        -99.667054
      ]
    ]
  },
  {
    "stepIndex": 57,
    "bloque": 2,
    "bloqueNombre": "Rehabilitación de Pavimento",
    "numeroEnBloque": 38,
    "totalEnBloque": 39,
    "tipoObraPdf": "REHABILITACIÓN DE PAVIMENTO",
    "calle": "SAN PABLO",
    "descripcionPdf": "RECONSTRUCCIÓN DE PAVIMENTACIÓN CON CARPETA ASFÁLTICA EN LA CALLE SAN PABLO, EN EL TRAMO COMPRENDIDO DE CALLE SILVERIO PÉREZ Y CARRETERA A VILLA CUAUHTÉMOC, VILLAS SANTÍN, DELEGACIÓN SAUCES, MUNICIPIO DE TOLUCA.",
    "delegacion": "SAUCES",
    "metrosLineales": 325.58,
    "superficieM2": 3075.1,
    "estatusPdf": "TERMINADA",
    "contratoKey": "MT/DGOP/FAISMUN/LPN-095/2026",
    "lpnNum": 95,
    "dragonId": null,
    "gidemId": null,
    "hasPhotosExpected": true,
    "fallbackCoords": [
      [
        19.370549,
        -99.582393
      ],
      [
        19.373137,
        -99.580791
      ]
    ]
  },
  {
    "stepIndex": 58,
    "bloque": 2,
    "bloqueNombre": "Rehabilitación de Pavimento",
    "numeroEnBloque": 39,
    "totalEnBloque": 39,
    "tipoObraPdf": "REHABILITACIÓN DE PAVIMENTO",
    "calle": "INSURGENTES (TECAXIC)",
    "descripcionPdf": "RECONSTRUCCIÓN DE PAVIMENTACIÓN CON CONCRETO HIDRÁULICO DE LA CALLE INSURGENTES, EN EL TRAMO COMPRENDIDO DE CALLE 16 DE SEPTIEMBRE HASTA CALLE VICENTE GUERRERO, DEL CADENAMIENTO 0+000 AL 0+231, DELEGACIÓN TECAXIC, TOLUCA.",
    "delegacion": "TECAXIC",
    "metrosLineales": 231.0,
    "superficieM2": 1133.65,
    "estatusPdf": "EN PROCESO",
    "contratoKey": "MT/DGOP/FEFOM/LPN-107/2026",
    "lpnNum": 107,
    "dragonId": null,
    "gidemId": null,
    "hasPhotosExpected": true,
    "fallbackCoords": [
      [
        19.325494,
        -99.715084
      ],
      [
        19.324198,
        -99.715002
      ],
      [
        19.32402,
        -99.714961
      ],
      [
        19.323544,
        -99.715001
      ],
      [
        19.323335,
        -99.714839
      ]
    ]
  },
  {
    "stepIndex": 59,
    "bloque": 3,
    "bloqueNombre": "Diablo Dragón",
    "numeroEnBloque": 1,
    "totalEnBloque": 10,
    "tipoObraPdf": "DIABLO DRAGÓN",
    "calle": "LAGUNA DE SIETE COLORES",
    "descripcionPdf": "REHABILITACIÓN DE PAVIMENTACIÓN DE CARPETA ASFÁLTICA EN LA CALLE LAGUNA DE SIETE COLORES, DEL TRAMO COMPRENDIDO ENTRE AV. TORRES CHICAS HASTA LA AV. ADOLFO LÓPEZ MATEOS, DELEGACIÓN ADOLFO LÓPEZ MATEOS, MUNICIPIO DE TOLUCA.",
    "delegacion": "ADOLFO LÓPEZ MATEOS",
    "metrosLineales": 1062.0,
    "superficieM2": 15374.35,
    "estatusPdf": "DIABLO DRAGÓN",
    "contratoKey": "DR-02",
    "lpnNum": null,
    "dragonId": "DR-02",
    "gidemId": null,
    "hasPhotosExpected": true,
    "fallbackCoords": [
      [
        19.287632,
        -99.682912
      ],
      [
        19.287485,
        -99.683114
      ],
      [
        19.287209,
        -99.687823
      ],
      [
        19.286779,
        -99.69299
      ]
    ]
  },
  {
    "stepIndex": 60,
    "bloque": 3,
    "bloqueNombre": "Diablo Dragón",
    "numeroEnBloque": 2,
    "totalEnBloque": 10,
    "tipoObraPdf": "DIABLO DRAGÓN",
    "calle": "SANTOS DEGOLLADO",
    "descripcionPdf": "REHABILITACIÓN DE PAVIMENTACIÓN DE CARPETA ASFÁLTICA EN LA CALLE SANTOS DEGOLLADO, EN EL TRAMO COMPRENDIDO DE LA AV. ISIDRO FABELA HASTA LA GLORIETA PASEO DE LOS MATLAZINCAS, DELEGACIÓN ÁRBOL DE LAS MANITAS, MUNICIPIO DE TOLUCA.",
    "delegacion": "ÁRBOL DE LAS MANITAS",
    "metrosLineales": 298.0,
    "superficieM2": 7815.1,
    "estatusPdf": "DIABLO DRAGÓN",
    "contratoKey": "DR-07",
    "lpnNum": null,
    "dragonId": "DR-07",
    "gidemId": null,
    "hasPhotosExpected": true,
    "fallbackCoords": [
      [
        19.303494,
        -99.643098
      ],
      [
        19.302465,
        -99.643122
      ],
      [
        19.300132,
        -99.643663
      ]
    ]
  },
  {
    "stepIndex": 61,
    "bloque": 3,
    "bloqueNombre": "Diablo Dragón",
    "numeroEnBloque": 3,
    "totalEnBloque": 10,
    "tipoObraPdf": "DIABLO DRAGÓN",
    "calle": "PASEO MATLAZINCAS",
    "descripcionPdf": "REHABILITACIÓN DE PAVIMENTACIÓN DE CARPETA ASFÁLTICA EN PASEO MATLAZINCAS, EN EL TRAMO COMPRENDIDO DE AV. ADOLFO LÓPEZ MATEOS HASTA LA AV. HEROICO COLEGIO MILITAR, DELEGACIONES SÁNCHEZ, BARRIOS TRADICIONALES Y ÁRBOL DE LAS MANITAS, MUNICIPIO DE TOLUCA.",
    "delegacion": "ÁRBOL DE LAS MANITAS, BARRIOS TRADICIONALES Y SÁNCHEZ",
    "metrosLineales": 9660.0,
    "superficieM2": 41737.2,
    "estatusPdf": "DIABLO DRAGÓN",
    "contratoKey": "DR-06",
    "lpnNum": null,
    "dragonId": "DR-06",
    "gidemId": null,
    "hasPhotosExpected": true,
    "fallbackCoords": [
      [
        19.288676,
        -99.679537
      ],
      [
        19.291113,
        -99.676492
      ],
      [
        19.294917,
        -99.674706
      ],
      [
        19.296873,
        -99.674187
      ],
      [
        19.298026,
        -99.672614
      ],
      [
        19.298305,
        -99.668838
      ],
      [
        19.297746,
        -99.66423
      ],
      [
        19.298368,
        -99.663622
      ],
      [
        19.29948,
        -99.664258
      ],
      [
        19.300768,
        -99.664968
      ],
      [
        19.301708,
        -99.664119
      ],
      [
        19.301605,
        -99.659991
      ],
      [
        19.299444,
        -99.655046
      ],
      [
        19.297444,
        -99.654425
      ],
      [
        19.295496,
        -99.651038
      ]
    ]
  },
  {
    "stepIndex": 62,
    "bloque": 3,
    "bloqueNombre": "Diablo Dragón",
    "numeroEnBloque": 4,
    "totalEnBloque": 10,
    "tipoObraPdf": "DIABLO DRAGÓN",
    "calle": "VALENTÍN GÓMEZ FARÍAS",
    "descripcionPdf": "REHABILITACIÓN DE PAVIMENTACIÓN DE CARPETA ASFÁLTICA EN LA CALLE VALENTÍN GÓMEZ FARÍAS DEL TRAMO COMPRENDIDO ENTRE CALLE 28 DE OCTUBRE HASTA LA CALLE IGNACIO LÓPEZ RAYÓN, DELEGACIÓN CENTRO HISTÓRICO / SAN SEBASTIÁN, MUNICIPIO DE TOLUCA.",
    "delegacion": "CENTRO HISTÓRICO",
    "metrosLineales": 1829.0,
    "superficieM2": 18427.07,
    "estatusPdf": "DIABLO DRAGÓN",
    "contratoKey": "DR-04",
    "lpnNum": null,
    "dragonId": "DR-04",
    "gidemId": null,
    "hasPhotosExpected": true,
    "fallbackCoords": [
      [
        19.285813,
        -99.635364
      ],
      [
        19.285576,
        -99.644106
      ],
      [
        19.285349,
        -99.652788
      ]
    ]
  },
  {
    "stepIndex": 63,
    "bloque": 3,
    "bloqueNombre": "Diablo Dragón",
    "numeroEnBloque": 5,
    "totalEnBloque": 10,
    "tipoObraPdf": "DIABLO DRAGÓN",
    "calle": "AV. HEROICO COLEGIO MILITAR",
    "descripcionPdf": "REHABILITACIÓN DE PAVIMENTACIÓN DE CARPETA ASFÁLTICA EN LA CALLE AV. HEROICO COLEGIO MILITAR, EN EL TRAMO COMPRENDIDO DE PASEO MATLAZINCAS A LAS CALLES DIEGO RIVERA E ISIDRO FABELA, DELEGACIÓN LA MAQUINITA, MUNICIPIO DE TOLUCA.",
    "delegacion": "LA MAQUINITA",
    "metrosLineales": 763.0,
    "superficieM2": 12819.8,
    "estatusPdf": "DIABLO DRAGÓN",
    "contratoKey": "DR-08",
    "lpnNum": null,
    "dragonId": "DR-08",
    "gidemId": null,
    "hasPhotosExpected": true,
    "fallbackCoords": [
      [
        19.299911,
        -99.64384
      ],
      [
        19.299574,
        -99.643758
      ],
      [
        19.299462,
        -99.643463
      ],
      [
        19.299665,
        -99.643325
      ],
      [
        19.30001,
        -99.643444
      ],
      [
        19.300119,
        -99.643659
      ],
      [
        19.300053,
        -99.643787
      ],
      [
        19.301975,
        -99.644694
      ],
      [
        19.302415,
        -99.64478
      ],
      [
        19.305279,
        -99.644677
      ],
      [
        19.305606,
        -99.644098
      ]
    ]
  },
  {
    "stepIndex": 64,
    "bloque": 3,
    "bloqueNombre": "Diablo Dragón",
    "numeroEnBloque": 6,
    "totalEnBloque": 10,
    "tipoObraPdf": "DIABLO DRAGÓN",
    "calle": "BENITO JUÁREZ",
    "descripcionPdf": "REHABILITACIÓN DE PAVIMENTACIÓN DE CARPETA ASFÁLTICA EN LA CALLE BENITO JUÁREZ, DEL TRAMO COMPRENDIDO ENTRE PASEO MATLAZINCAS HASTA FILIBERTO NAVAS, DELEGACIÓN SAN MATEO OXTOTITLÁN, MUNICIPIO DE TOLUCA.",
    "delegacion": "SAN MATEO OXTOTITLÁN",
    "metrosLineales": 1832.0,
    "superficieM2": 19214.16,
    "estatusPdf": "DIABLO DRAGÓN",
    "contratoKey": "DR-01",
    "lpnNum": null,
    "dragonId": "DR-01",
    "gidemId": null,
    "hasPhotosExpected": true,
    "fallbackCoords": [
      [
        19.288776,
        -99.679633
      ],
      [
        19.289754,
        -99.682027
      ],
      [
        19.289951,
        -99.682362
      ],
      [
        19.291066,
        -99.683152
      ],
      [
        19.29195,
        -99.684325
      ],
      [
        19.292915,
        -99.685911
      ],
      [
        19.294117,
        -99.688623
      ],
      [
        19.296537,
        -99.69126
      ],
      [
        19.296733,
        -99.694224
      ]
    ]
  },
  {
    "stepIndex": 65,
    "bloque": 3,
    "bloqueNombre": "Diablo Dragón",
    "numeroEnBloque": 7,
    "totalEnBloque": 10,
    "tipoObraPdf": "DIABLO DRAGÓN",
    "calle": "DE LOS PANTEONES",
    "descripcionPdf": "REHABILITACIÓN DE PAVIMENTACIÓN DE CARPETA ASFÁLTICA EN LA CALLE DE LOS PANTEONES, EN EL TRAMO COMPRENDIDO ENTRE AV. ADOLFO LÓPEZ MATEOS HASTA LA CALLE BENITO JUÁREZ, DELEGACIÓN SAN MATEO OXTOTITLÁN, MUNICIPIO DE TOLUCA.",
    "delegacion": "SAN MATEO OXTOTITLÁN",
    "metrosLineales": 390.0,
    "superficieM2": 3827.2,
    "estatusPdf": "DIABLO DRAGÓN",
    "contratoKey": "DR-05",
    "lpnNum": null,
    "dragonId": "DR-05",
    "gidemId": null,
    "hasPhotosExpected": true,
    "fallbackCoords": [
      [
        19.291437,
        -99.683651
      ],
      [
        19.288972,
        -99.683822
      ],
      [
        19.287966,
        -99.683721
      ]
    ]
  },
  {
    "stepIndex": 66,
    "bloque": 3,
    "bloqueNombre": "Diablo Dragón",
    "numeroEnBloque": 8,
    "totalEnBloque": 10,
    "tipoObraPdf": "DIABLO DRAGÓN",
    "calle": "JUAN ALDAMA",
    "descripcionPdf": "REHABILITACIÓN DE PAVIMENTACIÓN DE CARPETA ASFÁLTICA EN LA CALLE JUAN ALDAMA, EN EL TRAMO COMPRENDIDO DE LA AV. ADOLFO LÓPEZ MATEOS A LA CALLE BENITO JUÁREZ, DELEGACIÓN SAN MATEO OXTOTITLÁN, MUNICIPIO DE TOLUCA.",
    "delegacion": "SAN MATEO OXTOTITLÁN",
    "metrosLineales": 541.0,
    "superficieM2": 5311.0,
    "estatusPdf": "DIABLO DRAGÓN",
    "contratoKey": "DR-10",
    "lpnNum": null,
    "dragonId": "DR-10",
    "gidemId": null,
    "hasPhotosExpected": true,
    "fallbackCoords": [
      [
        19.293158,
        -99.686545
      ],
      [
        19.292469,
        -99.686557
      ],
      [
        19.292401,
        -99.686469
      ],
      [
        19.28832,
        -99.686826
      ]
    ]
  },
  {
    "stepIndex": 67,
    "bloque": 3,
    "bloqueNombre": "Diablo Dragón",
    "numeroEnBloque": 9,
    "totalEnBloque": 10,
    "tipoObraPdf": "DIABLO DRAGÓN",
    "calle": "FRANCISCO MURGUÍA",
    "descripcionPdf": "REHABILITACIÓN DE PAVIMENTACIÓN DE CARPETA ASFÁLTICA EN LA CALLE FRANCISCO MURGUÍA, DEL TRAMO COMPRENDIDO ENTRE PASEO CRISTÓBAL COLÓN HASTA BOULEVARD JOSÉ MARÍA PINO SUÁREZ, DELEGACIÓN SAN SEBASTIÁN / CENTRO HISTÓRICO, MUNICIPIO DE TOLUCA.",
    "delegacion": "SAN SEBASTIÁN",
    "metrosLineales": 971.0,
    "superficieM2": 11176.4,
    "estatusPdf": "DIABLO DRAGÓN",
    "contratoKey": "DR-03",
    "lpnNum": null,
    "dragonId": "DR-03",
    "gidemId": null,
    "hasPhotosExpected": true,
    "fallbackCoords": [
      [
        19.280927,
        -99.658279
      ],
      [
        19.281036,
        -99.651255
      ],
      [
        19.281057,
        -99.649139
      ]
    ]
  },
  {
    "stepIndex": 68,
    "bloque": 3,
    "bloqueNombre": "Diablo Dragón",
    "numeroEnBloque": 10,
    "totalEnBloque": 10,
    "tipoObraPdf": "DIABLO DRAGÓN",
    "calle": "16 DE SEPTIEMBRE",
    "descripcionPdf": "REHABILITACIÓN DE PAVIMENTACIÓN DE CARPETA ASFÁLTICA EN LA CALLE 16 DE SEPTIEMBRE, DEL TRAMO COMPRENDIDO ENTRE JOSÉ MA. MORELOS HASTA IGNACIO PICHARDO PAGAZA, DELEGACIÓN SANTA ANA TLAPALTITLÁN, MUNICIPIO DE TOLUCA.",
    "delegacion": "SANTA ANA TLAPALTITLÁN",
    "metrosLineales": 232.53,
    "superficieM2": 20520.0,
    "estatusPdf": "DIABLO DRAGÓN",
    "contratoKey": null,
    "lpnNum": null,
    "dragonId": null,
    "gidemId": null,
    "hasPhotosExpected": false,
    "fallbackCoords": [
      [
        19.278718,
        -99.615514
      ],
      [
        19.27875,
        -99.61125
      ]
    ]
  }
];

/**
 * Vincula un paso de la Ruta de Demostración con su ObraTramo real cargada en el estado de la app
 * para obtener sus evidencias fotográficas y geometría en tiempo real.
 */
export function resolveObraForDemoStep(
  step: DemoTourStep,
  obrasTramos: ObraTramo[]
): ObraTramo {
  let matched: ObraTramo | undefined;

  if (step.lpnNum) {
    const lpnTag = `LPN-${String(step.lpnNum).padStart(3, '0')}`;
    matched = obrasTramos.find(o => 
      (o.contrato && o.contrato.toUpperCase().includes(lpnTag) && (o.anio === 2026 || o.contrato.includes('2026'))) ||
      (o.idContrato && o.idContrato.toUpperCase().includes(lpnTag))
    );
  } else if (step.dragonId) {
    matched = obrasTramos.find(o => 
      o.tipo === 'dragon' && (
        o.contrato === step.dragonId ||
        o.idContrato === step.dragonId ||
        o.id.includes(step.dragonId!)
      )
    );
  } else if (step.gidemId) {
    const cleanCalle = step.calle.toLowerCase().replace(/[^a-z0-9]/g, '');
    matched = obrasTramos.find(o => 
      o.esPlaneada && o.nombre.toLowerCase().replace(/[^a-z0-9]/g, '').includes(cleanCalle.slice(0, 12))
    );
  }

  if (matched) {
    return {
      ...matched,
      coords: matched.coords && matched.coords.length > 0 ? matched.coords : step.fallbackCoords,
      metrosLineales: step.metrosLineales || matched.metrosLineales,
      superficie: step.superficieM2 || matched.superficie,
      delegacion: step.delegacion || matched.delegacion
    };
  }

  // Fallback sintético cuando es una obra en licitación o planeada que no está en obrasTramos
  return {
    id: `demo-step-${step.stepIndex}`,
    contrato: step.contratoKey || (step.estatusPdf.includes('LICITACIÓN') ? 'EN LICITACIÓN PÚBLICA' : step.estatusPdf),
    nombre: step.descripcionPdf,
    tipo: step.bloque === 3 ? 'dragon' : (step.tipoObraPdf.includes('SLURRY') ? 'slurry' : 'pavimentacion'),
    subtipo: step.tipoObraPdf.includes('ECOLÓGICO') ? 'ecologico' : (step.tipoObraPdf.includes('HIDRÁULICO') ? 'hidraulico' : 'asfaltica'),
    anio: 2026,
    delegacion: step.delegacion,
    metrosLineales: step.metrosLineales,
    superficie: step.superficieM2,
    esPlaneada: !step.hasPhotosExpected && step.bloque !== 3,
    geometriaTipo: 'tramo',
    coords: step.fallbackCoords
  };
}
