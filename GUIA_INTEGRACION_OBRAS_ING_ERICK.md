# Guía Técnica de Integración y Visualización de Obras
## Geoportal Toluca Capital — Documento de Contexto para el Ing. Erick

> **Dirigido a:** Ing. Erick  
> **Propósito:** Transferencia de arquitectura, fuentes de datos, reglas geométricas, extracción fotográfica y simbología para la replicación del visor cartográfico de obra pública de Toluca.  
> **Estado del Sistema:** Producción / En línea (2026).

---

## 1. Geometrías de Obra y Origen de Datos

En el sistema cartográfico de Toluca, las intervenciones de obra pública se dividen estrictamente en dos familias geométricas: **Obras Puntuales** y **Obras de Tramo Vial** (además de la capa especializada de **Bacheo**).

### 1.1. Diferencia Conceptual y Algorítmica

| Característica | Obras Puntuales (`puntual`) | Obras de Tramo (`tramo`) |
| :--- | :--- | :--- |
| **Definición** | Ubicación geográfica única y exacta en el espacio. | Secuencia ordenada de vértices que recorren un eje vial. |
| **Estructura Geo** | Un único par `[latitud, longitud]`. | Arreglo de coordenadas `[[lat1, lng1], [lat2, lng2], ..., [latN, lngN]]`. |
| **Componente Mapa** | Marcador / Pin (`L.marker` o `Marker`). | Línea continua (`Polyline` / `GeoJSON LineString`) + Pin en punto medio. |
| **Métrica calculada** | Cantidad de planteles, cruces o pozos (enteros). | Longitud total en **Metros Lineales (ML)** calculada con fórmula de distancia. |
| **Manejo de traslapes** | Si dos obras comparten idéntica coordenada, se aplica un leve **jitter / offset dispersor** (~15 metros) para que ambos pines sean interactivos. | El pin de detalle se ubica en el **punto medio geométrico (`midpoint`)** exacto a lo largo de la traza para que no quede en los extremos. |

#### Algoritmo de Punto Medio (`getTramoMidpoint`):
Para calcular dónde colocar el marcador de una calle con múltiples curvas o vértices:
1. Se calcula la distancia acumulada de cada segmento de la polilínea.
2. Se determina la mitad de la longitud total (`distanciaTotal / 2`).
3. Se interpola linealmente entre los dos vértices donde cae la mitad exacta.

#### Algoritmo de Metros Lineales (`calcularMetrosLinealesTramo`):
Suma de distancias geodésicas (Haversine o aproximación euclidiana corregida por latitud) entre cada par sucesivo `P[i]` y `P[i+1]`:
$$\text{distancia} \approx \sqrt{(\Delta \text{lat} \cdot 111,320)^2 + (\Delta \text{lng} \cdot 111,320 \cdot \cos(\text{lat}))^2}$$

---

### 1.2. Clasificación de Obras por Geometría

#### A. Obras Puntuales:
- **Arcotechos Escolares**: Techumbres estructurales instaladas en patios cívicos de planteles escolares (primarias, secundarias, preparatorias, CBTs).
- **Equipamiento Social**: Construcción de aulas, multideportivos, canchas y salones de usos múltiples.
- **Señalamiento Vial**: Puntos críticos de intervención de balizamiento, semaforización, cruces peatonales y pintura vial.
- **Pozos de Agua (OAyST)**: Infraestructura de extracción de agua potable y pozos de absorción pluvial del Organismo de Agua y Saneamiento de Toluca.

#### B. Obras de Tramo:
- **Pavimentaciones**:
  - *Asfáltica*: Reencarpetado o tendido asfáltico en caliente.
  - *Concreto Hidráulico*: Pavimento rígido de alta durabilidad para avenidas principales o transporte pesado.
  - *Concreto Ecológico / Permeable*: Pavimentos que permiten la filtración pluvial directa a mantos acuíferos.
- **Mantenimiento Slurry**: Aplicación de sello asfáltico preventivo (mortero asfáltico en frío) para extender la vida útil de carpetas en buen estado.
- **Senderos Seguros**: Rehabilitación integral de andadores y banquetas con iluminación LED, cámaras y perspectiva de género.
- **Drenajes y Colectores Sanitarios (OAyST)**: Tramos de tuberías subterráneas para desalojo de aguas residuales y pluviales (ej. Colectores Las Jaras, Totoltepec, etc.).
- **Diablo Dragón**: Tramos intervenidos por la maquinaria de reciclado térmico de asfalto en sitio (10 vialidades estructuradas).

---

### 1.3. Conexión y Extracción en Base de Datos (Supabase Alfa)

Toda la información se aloja en el servidor dedicado de base de datos **Supabase Alfa** de la Dirección de Obras:

- **Host URL Base**: `https://realized-wider-walked-donors.trycloudflare.com`
- **PostgREST Endpoint**: `https://realized-wider-walked-donors.trycloudflare.com/rest/v1/`
- **Anon Public API Key**:
  ```text
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE
  ```
- **Headers HTTP requeridos para Fetch**:
  ```javascript
  {
    "apikey": "<ANON_KEY>",
    "Authorization": "Bearer <ANON_KEY>",
    "Content-Type": "application/json"
  }
  ```

#### Tablas y Vistas Disponibles en PostgREST (`schema: public`):

1. **`public.mapeo_p` (Obras Puntuales)**:
   - *Columnas clave*:
     - `No. Contrato` / `idContrato`: Identificador interno (ej. `FENA-097`, `PRO-062`).
     - `Nombre de la Obra`: Descripción completa oficial.
     - `Tipo de Obra`: Clasificación en texto crudo.
     - `Inicio de Ejecucion` / `Termino de Ejecucion`: Fechas en formato `D/M/YYYY`.
     - `Geolocalización`: Cadena de coordenadas (ej. `"19.294117, -99.688623"`).
     - `Delegación`: Delegación municipal correspondiente.

2. **`public.mapeo_t` (Obras de Tramo)**:
   - *Columnas clave*:
     - Mismos metadatos administrativos (`No. Contrato`, `Nombre de la Obra`, fechas).
     - **Vértices dinámicos**: Columnas nombradas `Geolocalización P1`, `Geolocalización P2`, ..., `Geolocalización P17`.
     - *Regla de parseo*: Se deben iterar todas las columnas que hagan match con `/P\d+/i`, ordenarlas numéricamente (`P1`, `P2`, `P3`...) y filtrar las nulas o vacías.

3. **`public.diablo_dragon` (Obras Diablo Dragón)**:
   - *Columnas clave*:
     - `idDragon`: Código del tramo (`DR-01` a `DR-10`).
     - `Calle`: Nombre de la avenida o vialidad.
     - `Nombre de la Obra`: Descripción del paso de la máquina.
     - `Inicio de Ejecucion` / `Termino de Ejecucion`.
     - `Geolocalización P1` a `Geolocalización P17`: Vértices viales exactos.

4. **`contratos_test.infoContratos` (Tabla Maestra Administrativa)**:
   - Contiene los montos contratados, empresas, techos presupuestales y periodos oficiales.

---

## 2. Servidor de Fotografías, Rutas y Lógica de Evidencias

Las imágenes de evidencia fotográfica se sirven desde un túnel dedicado de almacenamiento Nginx de alta velocidad:

- **Host Base de Fotografías**:  
  `https://dependent-max-warcraft-portsmouth.trycloudflare.com/imagenes/`

El sistema gestiona **dos esquemas fotográficos** dependiendo de la naturaleza de la obra:

---

### 2.1. Obras Tradicionales (Contratos 2026) — Esquema de 3 Fases

Para todas las obras licitadas regulares, las fotografías siguen la secuencia temporal de 3 etapas: **Inicio**, **Proceso** y **Terminado**.

#### Ruta en el Servidor:
```text
https://dependent-max-warcraft-portsmouth.trycloudflare.com/imagenes/EVIDENCIAS DE OBRAS 2026/<CATEGORIA>/<ID_CONTRATO>/
```

#### Nombres de Archivo Estandarizados:
1. **`_inicio.jpeg`**: Fotografía del sitio previo al inicio de los trabajos.
2. **`_proceso.jpeg`**: Fotografía de los trabajos en ejecución física.  
   *(Si existen múltiples avances secuenciales, se nombran `_proceso_1.jpeg`, `_proceso_2.jpeg`, etc.)*.
3. **`_terminado.jpeg`**: Fotografía de la obra entregada y finalizada.

#### Regla de Negocio Crítica (Estatus de Conclusión):
> **Regla de Conclusión Inmediata:**  
> Si una obra cuenta físicamente con el archivo `_terminado.jpeg`, **debe marcarse como CONCLUIDA**, independientemente de si la fecha actual en la línea de tiempo del mapa aún no ha alcanzado la fecha de término programada.

#### Ruta de Respaldo (*Fallback*):
En caso de que una imagen no cargue por el `ID_CONTRATO` interno (ej. `FENA-097`), el sistema intenta un fallback contra el número oficial completo reemplazando barras por guiones:
`EVIDENCIAS DE OBRAS 2026/<CATEGORIA>/<NO_CONTRATO_NORMALIZADO>/INICIAL.jpeg` o `PROCESO.jpeg`.

#### Catálogo JSON Centralizado:
El archivo `public/data/evidencias_obras_2026.json` ya tiene indexadas y preparadas todas las URLs precompiladas para evitar peticiones 404 al vuelo.

---

### 2.2. Obras del "Diablo Dragón" — Esquema de 6 Fases Continuas

La pavimentadora automática "Diablo Dragón" es una recicladora continua de asfalto en sitio. Por su metodología operativa, **no encaja en el esquema de antes/durante/después**, sino en un **seguimiento longitudinal de 6 fotografías**.

#### Ruta en el Servidor:
```text
https://dependent-max-warcraft-portsmouth.trycloudflare.com/imagenes/DIABLO DRAGON/<CARPETA_VIALIDAD>/<NUMERO>.jpeg
```

Donde `<NUMERO>` es un entero de `1` a `6` (`1.jpeg`, `2.jpeg`, `3.jpeg`, `4.jpeg`, `5.jpeg`, `6.jpeg`).

#### Mapeo Exacto de Carpetas (10 Obras):
| ID Dragón | Vialidad en Base de Datos | Carpeta en Servidor Remoto | No. Fotos |
| :---: | :--- | :--- | :---: |
| **DR-01** | Calle Benito Juárez | `BENITO JUAREZ` | 6 (`1.jpeg` a `6.jpeg`) |
| **DR-02** | Laguna 7 Colores | `LAGUNA SIETE COLORES` | 6 (`1.jpeg` a `6.jpeg`) |
| **DR-03** | Calle Francisco Murguía | `FRANCISCO MURGIA` | 6 (`1.jpeg` a `6.jpeg`) |
| **DR-04** | Valentín Gómez Farías | `VALENTIN GOMEZ FARIAS` | 6 (`1.jpeg` a `6.jpeg`) |
| **DR-05** | De Los Panteones | `DE LOS PANTEONES` | 6 (`1.jpeg` a `6.jpeg`) |
| **DR-06** | Paseo Matlazincas | `PASEO MATLAZINCAS` | 6 (`1.jpeg` a `6.jpeg`) |
| **DR-07** | Santos Degollado | `SANTOS DEGOLLADO` | 6 (`1.jpeg` a `6.jpeg`) |
| **DR-08** | Av. Heroico Colegio Militar (Carril Der.) | `HEROICO COLEGIO MILITAR DERECHA` | 6 (`1.jpeg` a `6.jpeg`) |
| **DR-09** | Av. Heroico Colegio Militar (Carril Izq.) | `HEROICO COLEGIO MILITAR IZQUIERDA` | 6 (`1.jpeg` a `6.jpeg`) |
| **DR-10** | Calle Juan Aldama | `JUAN ALDAMA` | 6 (`1.jpeg` a `6.jpeg`) |

#### Comportamiento en el Modal / Visor:
- No se muestran los botones de `Inicial / Proceso / Terminado`.
- Se monta un **carrusel de 6 pasos** con flechas prev/next, teclado (`ArrowLeft` / `ArrowRight`), línea de progreso numerada del 1 al 6 y tira de 6 miniaturas fotográficas para salto directo.

---

## 3. Colorimetría, Simbología e Iconografía

> 💡 **Nota para el Ing. Erick:**  
> La paleta de colores y la asignación de iconos que se describe a continuación corresponde a la identidad funcional implementada en nuestro visor de Toluca.  
> **Esta guía no es obligatoria ni restrictiva; tómala como una base de referencia que puedes adoptar, enriquecer o reinterpretar libremente** según el diseño, librería de iconos (Lucide, Heroicons, FontAwesome) o necesidades visuales de tu proyecto.

---

### 3.1. Paleta de Colores y Racional de Diseño

| Tipo de Obra | Código Color HEX | Clase Tailwind Sugerida | Icono Sugerido | Por qué de la elección |
| :--- | :---: | :---: | :---: | :--- |
| **Bacheo (DGOP / DGSP)** | `#16a34a` (Verde) / `#2563eb` (Azul) | `bg-emerald-600` / `bg-blue-600` | Martillo (`Hammer`) | Diferencia institucional: Verde representa la Dirección de Obras Públicas (DGOP); Azul representa Servicios Públicos (DGSP). |
| **Pavimentación Asfáltica** | `#2563eb` | `bg-blue-600` | Cono / Construcción (`Construction`) | Azul institucional clásico asociado al transporte vehicular y rodamiento. |
| **Pavimentación Hidráulica** | `#0284c7` | `bg-sky-600` | Construcción (`Construction`) | Azul cielo más brillante para denotar el concreto blanco / rígido de alta densidad. |
| **Pavimentación Ecológica** | `#059669` | `bg-emerald-600` | Construcción (`Construction`) | Verde esmeralda que comunica sustentabilidad ambiental y permeabilidad hídrica. |
| **Mantenimiento Slurry** | `#ea580c` | `bg-amber-600` / `bg-orange-600` | Flama / Calor (`Flame`) | Naranja asfáltico que simboliza la emulsión bituminosa preventiva aplicada sobre la superficie. |
| **Diablo Dragón** | `#dc2626` | `bg-red-600` | Flama / Dragón (`Flame`) | Rojo fuego de alto impacto que representa la temperatura y potencia de la máquina de reciclado en sitio. |
| **Senderos Seguros** | `#9333ea` | `bg-purple-600` | Huellas / Pasos (`Footprints`) | Morado representativo de los programas con perspectiva de género, seguridad para mujeres e iluminación peatonal. |
| **Arcotechos Escolares** | `#78350f` | `bg-amber-900` | Edificio / Escuela (`Building2`) | Tono tierra/café que evoca infraestructura escolar y techumbres metálicas en planteles. |
| **Pozos y Drenajes (OAyST)** | `#06b6d4` | `bg-cyan-600` | Gota de Agua (`Droplet`) | Cian acuático representativo del Organismo de Agua y Saneamiento (pozos de absorción y colectores sanitarios). |
| **Señalamiento Vial** | `#eab308` | `bg-yellow-500` | Triángulo Alerta (`AlertTriangle`) | Amarillo vial de alta visibilidad, correspondiente al balizamiento y señalética preventiva de tránsito. |

---

### 3.2. Borde Dorado Especial para Obras Concluidas (`#d4af37`)

Para dar un estímulo visual inmediato al usuario sobre qué vialidades o escuelas ya están terminadas:
- Todas las obras en estado `CONCLUIDA` sustituyen su borde blanco estándar por un **borde dorado de honor**:
  ```css
  border: 2.5px solid #d4af37 !important;
  box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.5), 0 3px 8px rgba(0, 0, 0, 0.35);
  ```
- Este borde dorado aplica automáticamente para:
  1. Obras que tengan su foto `_terminado.jpeg`.
  2. Las 10 vialidades del Diablo Dragón (ya que todas concluyeron con sus 6 evidencias).
  3. Obras cuya fecha de término programada sea anterior a la fecha actual.

---

### 3.3. Estructura Recomendada para Marcadores Personalizados (`DivIcon`)

Para que el mapa mantenga una estética limpia y moderna sin pines toscos de imagen:
```html
<div class="obra-pin-marker">
  <div class="obra-pin-badge" style="background-color: ${color}; ${borderDoradoSiTerminada}">
    <!-- SVG Blanco centrado de 13x13px del icono del módulo -->
    ${svgIconoBlanco}
  </div>
</div>
```

---

## 4. Resumen Rápido para Empezar

1. **Conexión**: Consume `public.mapeo_p` para puntos, `public.mapeo_t` para tramos y `public.diablo_dragon` para el Dragón usando la llave pública anónima de PostgREST.
2. **Coordenadas**: Extrae números decimales con regex `/(-?\d+\.\d+)/g`. Recuerda que en Toluca la latitud ronda `+19.28` y la longitud `-99.65`. Si vienen invertidas, cámbialas.
3. **Fotografías**: Utiliza el base URL de Nginx. Si la obra es normal, busca `_inicio`, `_proceso` y `_terminado`. Si es Diablo Dragón, itera del `1.jpeg` al `6.jpeg`.
4. **Diseño**: Adapta la paleta cromática a tu criterio visual; el esquema propuesto te asegurará que ningún módulo compita o se confunda con otro.

¡Mucho éxito en la implementación de tu mapa, Erick! Cualquier duda técnica sobre la base o los endpoints, estamos a la orden.
