/**
 * Servidor de la Torre de Control - Toluca
 */
function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('Torre de Control de Bacheo - Toluca')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// --- CAPA 1: Extractor Dinámico con Inteligencia de Coordenadas ---
function obtenerDatosPuntos() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  function leerHoja(nombreHoja) {
    const hoja = ss.getSheetByName(nombreHoja.trim());
    if (!hoja) {
      console.error("Hoja no encontrada: " + nombreHoja);
      return [];
    }
    
    const datos = hoja.getDataRange().getValues();
    if(datos.length < 2) return [];
    
    const cabeceras = datos[0].map(c => String(c).toLowerCase().trim());
    
    // Rastreadores de Columnas
    const iLat = cabeceras.findIndex(c => c.includes('lat'));
    const iLng = cabeceras.findIndex(c => c.includes('lon') || c.includes('lng'));
    const iCoord = cabeceras.indexOf('coordenadas'); // Por si no están separadas
    const iTicket = cabeceras.findIndex(c => c.includes('ticket') || c.includes('folio') || c.includes('id'));
    const iCalle = cabeceras.findIndex(c => c.includes('calle'));
    const iObs = cabeceras.findIndex(c => c.includes('obs') || c.includes('detalle') || c.includes('colonia'));

    const resultados = [];
    for (let i = 1; i < datos.length; i++) {
      const fila = datos[i];
      let lat, lng;

      // Lógica de detección: ¿Columnas separadas o columna única?
      if (iLat >= 0 && iLng >= 0 && fila[iLat] && fila[iLng]) {
        lat = parseFloat(fila[iLat]);
        lng = parseFloat(fila[iLng]);
      } else if (iCoord >= 0 && fila[iCoord]) {
        // Si están en una sola celda, extraemos los números
        const match = String(fila[iCoord]).match(/[-+]?[0-9]*\.?[0-9]+/g);
        if (match && match.length >= 2) {
          lat = parseFloat(match[0]);
          lng = parseFloat(match[1]);
        }
      }
      
      if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
        resultados.push({
          id: iTicket >= 0 && fila[iTicket] ? fila[iTicket] : "S/N",
          calle: iCalle >= 0 && fila[iCalle] ? fila[iCalle] : "Ubicación no especificada",
          obs: iObs >= 0 && fila[iObs] ? fila[iObs] : "Sin detalles adicionales",
          lat: lat,
          lng: lng
        });
      }
    }
    return resultados;
  }

  return JSON.stringify({
    amarillos: leerHoja("RESUMEN - TICKETS SIN ATENDER"),
    verdes: leerHoja("3 - ETAPA 3 MASTER"),
    rojos: leerHoja("NUEVOS TICKETS")
  });
}

// --- CAPA 2: Contratos ---
function obtenerDatosContratos() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hoja = ss.getSheetByName("Registros Contratos Reales");
  if (!hoja) return JSON.stringify({});
  const datos = hoja.getDataRange().getValues();
  const contratosMap = {};
  for (let i = 1; i < datos.length; i++) {
    const d = datos[i];
    if (!d[2]) continue;
    const nomDel = String(d[2]).toUpperCase().trim();
    if (!contratosMap[nomDel]) contratosMap[nomDel] = [];
    contratosMap[nomDel].push({
      numero: d[0], folio: d[1],
      fin: d[4] instanceof Date ? Utilities.formatDate(d[4], "GMT", "dd/MM/yyyy") : d[4]
    });
  }
  return JSON.stringify(contratosMap);
}

// --- CAPAS GEOGRÁFICAS ---
function obtenerGeoJSON_Delegaciones() {
  return DriveApp.getFileById("17NzdBrF1Jn8u8Gaq4XZTRPQupWmLBquD").getBlob().getDataAsString();
}

function obtenerGeoJSON_OTs() {
  return DriveApp.getFileById("13M1zMUp3EpqrsQNaNUfHJGl3DyEUSkI4").getBlob().getDataAsString();
}