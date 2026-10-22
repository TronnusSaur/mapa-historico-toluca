import json
import urllib.parse

base_url = "https://imagenes.soranoserver.com/imagenes/EVIDENCIAS%20DE%20OBRAS%202025/"

with open('public/data/evidencias_obras_2025.json', 'r', encoding='utf-8') as f:
    ev_2025 = json.load(f)

# 1. AVGFYD-LP-001-2025
k1 = "MT/DGOP/AVGFYD/LP-001/2025"
folder1 = "SENDEROS%20Y%20PARQUES/MT-DGOP-AVGFYD-LP-001-2025/"
ev_2025[k1] = {
    "idContrato": "MT/DGOP/AVGFYD/LP-001/2025",
    "noContrato": "MT/DGOP/AVGFYD/LP-001/2025",
    "nombreObra": "RECUPERAR EL ESPACIO PÚBLICO CON PERSPECTIVA DE GÉNERO EN LA CALLE INDEPENDENCIA, ENTRE LAS CALLES VICENTE LOMBARDO TOLEDANO Y JUAN ESCUTIA, LA CRESPA- FLORESTA, TOLUCA, ESTADO DE MÉXICO",
    "tipoObra": "Rescate de Espacios Públicos, Parques y Senderos Seguros",
    "categoria": "SENDEROS Y PARQUES",
    "fotos": {
        "inicio": f"{base_url}{folder1}INICIO.jpeg",
        "proceso": [f"{base_url}{folder1}PROCESO%201.jpeg"],
        "terminado": f"{base_url}{folder1}TERMINADO%202.jpeg"
    },
    "fotosFallback": {
        "inicio": f"{base_url}{folder1}INICIO.jpeg",
        "proceso": [f"{base_url}{folder1}PROCESO%201.jpeg"],
        "terminado": f"{base_url}{folder1}TERMINADO%202.jpeg"
    }
}
ev_2025["MT-DGOP-AVGFYD-LP-001-2025"] = ev_2025[k1]

# 2. IPDM-LPN-003-2025
k3 = "MT/DGOP/IPDM/LPN-003/2025"
folder3 = "CANAL%20A%20CELO%20ABIERTO/MT-DGOP-IPDM-LPN-003-2025/"
ev_2025[k3] = {
    "idContrato": "MT/DGOP/IPDM/LPN-003/2025",
    "noContrato": "MT/DGOP/IPDM/LPN-003/2025",
    "nombreObra": "ENCOFRADO DE CANAL A CIELO ABIERTO PARA AGUAS PLUVIALES EN CALLE EMILIANO ZAPATA, LOCALIDAD DE SAN JOSÉ GUADALUPE OTZACATIPÁN, DELEGACIÓN SAN MATEO OTZACATIPAN MUNICIPIO DE TOLUCA",
    "tipoObra": "Pozos y Drenajes",
    "categoria": "CANAL A CIELO ABIERTO",
    "fotos": {
        "inicio": f"{base_url}{folder3}INICIO.jpeg",
        "proceso": [f"{base_url}{folder3}PROCESO.jpeg"],
        "terminado": f"{base_url}{folder3}TERMINADO.jpeg"
    },
    "fotosFallback": {
        "inicio": f"{base_url}{folder3}INICIO.jpeg",
        "proceso": [f"{base_url}{folder3}PROCESO.jpeg"],
        "terminado": f"{base_url}{folder3}TERMINADO.jpeg"
    }
}
ev_2025["MT-DGOP-IPDM-LPN-003-2025"] = ev_2025[k3]

# 3. IPDM-LPN-045-2025
k45 = "MT/DGOP/IPDM/LPN-045/2025"
folder45 = "SENDEROS%20Y%20PARQUES/MT-DGOP-IPDM-LPN-045-2025/"
ev_2025[k45] = {
    "idContrato": "MT/DGOP/IPDM/LPN-045/2025",
    "noContrato": "MT/DGOP/IPDM/LPN-045/2025",
    "nombreObra": "REHABILITACIÓN DEL PARQUE CUAUHTÉMOC (ALAMEDA CENTRAL), BARRIO LA MERCED, COL. CENTRO, MUNICIPIO DE TOLUCA, MÉXICO",
    "tipoObra": "Rescate de Espacios Públicos, Parques y Senderos Seguros",
    "categoria": "SENDEROS Y PARQUES",
    "fotos": {
        "inicio": f"{base_url}{folder45}INICIO.jpeg",
        "proceso": [f"{base_url}{folder45}PROCESO.jpeg"],
        "terminado": f"{base_url}{folder45}TERMINADO.jpeg"
    },
    "fotosFallback": {
        "inicio": f"{base_url}{folder45}INICIO.jpeg",
        "proceso": [f"{base_url}{folder45}PROCESO.jpeg"],
        "terminado": f"{base_url}{folder45}TERMINADO.jpeg"
    }
}
ev_2025["MT-DGOP-IPDM-LPN-045-2025"] = ev_2025[k45]

# 4. IPDM-LPN-004-2025 (on server as IR-004)
k4 = "MT/DGOP/IPDM/LPN-004/2025"
folder4 = "REHABILITACION%20DE%20CARPETAS/MT-DGOP-IPDM-IR-004-2025/"
ev_2025[k4] = {
    "idContrato": "MT/DGOP/IPDM/LPN-004/2025",
    "noContrato": "MT/DGOP/IPDM/LPN-004/2025",
    "nombreObra": "REHABILITACIÓN DE PAVIMENTACIÓN CON CARPETA ASFÁLTICA DE LA CALLE INDUSTRIAS QUÍMICAS, ENTRE CALLE ALBERTO EINSTEIN Y CALLE LEONARDO DA VINCI Y ROBERTO BOSCH, ENTRE AV. INDUSTRIA AUTOMOTRIZ Y PRIMERO DE MAYO , SANTA ANA TLAPALTITLÁN, TOLUCA, MÉXICO.",
    "tipoObra": "Pavimentación y Repavimentación con Carpeta Asfáltica",
    "categoria": "REHABILITACION DE CARPETAS",
    "fotos": {
        "inicio": f"{base_url}{folder4}INICIO.jpeg",
        "proceso": [f"{base_url}{folder4}PROCESO.jpeg"],
        "terminado": f"{base_url}{folder4}TERMINADO.jpeg"
    },
    "fotosFallback": {
        "inicio": f"{base_url}{folder4}INICIO.jpeg",
        "proceso": [f"{base_url}{folder4}PROCESO.jpeg"],
        "terminado": f"{base_url}{folder4}TERMINADO.jpeg"
    }
}
ev_2025["MT-DGOP-IPDM-LPN-004-2025"] = ev_2025[k4]
ev_2025["MT-DGOP-IPDM-IR-004-2025"] = ev_2025[k4]

# 5. IPDM-LPN-002-2025 (on server as IR-002)
k2 = "MT/DGOP/IPDM/LPN-002/2025"
folder2 = "REHABILITACION%20DE%20CARPETAS/MT-DGOP-IPDM-IR-002-2025/"
ev_2025[k2] = {
    "idContrato": "MT/DGOP/IPDM/LPN-002/2025",
    "noContrato": "MT/DGOP/IPDM/LPN-002/2025",
    "nombreObra": "CONSTRUCCIÓN DE CAJA DERIVADORA DE CONCRETO ARMADO EN LA CALLE JUAN FERNÁNDEZ ALBARRÁN, ESQUINA BLVRD. AEROPUERTO, LOCALIDAD SAN JOSÉ GUADALUPE OTZACATIPÁN, DELEGACIÓN SAN MATEO OTZACATIPAN, TOLUCA, ESTADO DE MÉXICO.",
    "tipoObra": "Pozos y Drenajes",
    "categoria": "REHABILITACION DE CARPETAS",
    "fotos": {
        "inicio": f"{base_url}{folder2}INICIO.jpeg",
        "proceso": [f"{base_url}{folder2}PROCESO.jpeg"],
        "terminado": f"{base_url}{folder2}TERMINADO.jpeg"
    },
    "fotosFallback": {
        "inicio": f"{base_url}{folder2}INICIO.jpeg",
        "proceso": [f"{base_url}{folder2}PROCESO.jpeg"],
        "terminado": f"{base_url}{folder2}TERMINADO.jpeg"
    }
}
ev_2025["MT-DGOP-IPDM-LPN-002-2025"] = ev_2025[k2]
ev_2025["MT-DGOP-IPDM-IR-002-2025"] = ev_2025[k2]

# 6. FAISMUN-LPN-030-2025 subfolders
base_030 = f"{base_url}CONCRETOS%20ECOLOGICOS/MT-DGOP-FAISMUN-LPN-030-2025/"

# Default 030 general
ev_2025["MT-DGOP-FAISMUN-LPN-030-2025"]["fotos"] = {
    "inicio": f"{base_030}CALLE%20NEVADO/INICIO.jpg",
    "proceso": [f"{base_030}CALLE%20NEVADO/PROCESO.jpg"],
    "terminado": f"{base_030}CALLE%20NEVADO/TERMINADO.jpg"
}
ev_2025["MT-DGOP-FAISMUN-LPN-030-2025"]["fotosFallback"] = ev_2025["MT-DGOP-FAISMUN-LPN-030-2025"]["fotos"]

ev_2025["MT/DGOP/FAISMUN/LPN-030/2025"]["fotos"] = ev_2025["MT-DGOP-FAISMUN-LPN-030-2025"]["fotos"]
ev_2025["MT/DGOP/FAISMUN/LPN-030/2025"]["fotosFallback"] = ev_2025["MT-DGOP-FAISMUN-LPN-030-2025"]["fotos"]

# Specific sub-entries for the other two streets
ev_2025["LPN-030-2025-POPOCATEPETL"] = {
    "idContrato": "LPN-030-2025-POPOCATEPETL",
    "noContrato": "MT/DGOP/FAISMUN/LPN-030/2025",
    "nombreObra": "CONSTRUCCIÓN DE PAVIMENTACIÓN CON CONCRETO ECOLÓGICO EN LA CALLE PARQUE POPOCATÉPETL",
    "tipoObra": "Concreto Ecológico",
    "categoria": "CONCRETOS ECOLOGICOS",
    "fotos": {
        "inicio": f"{base_030}CALLE%20POPOCATEPETL/INICIO.jpg",
        "proceso": [f"{base_030}CALLE%20POPOCATEPETL/PROCESO.jpg"],
        "terminado": f"{base_030}CALLE%20POPOCATEPETL/TERMINADO.jpg"
    },
    "fotosFallback": {
        "inicio": f"{base_030}CALLE%20POPOCATEPETL/INICIO.jpg",
        "proceso": [f"{base_030}CALLE%20POPOCATEPETL/PROCESO.jpg"],
        "terminado": f"{base_030}CALLE%20POPOCATEPETL/TERMINADO.jpg"
    }
}

ev_2025["LPN-030-2025-AVES"] = {
    "idContrato": "LPN-030-2025-AVES",
    "noContrato": "MT/DGOP/FAISMUN/LPN-030/2025",
    "nombreObra": "CONSTRUCCIÓN DE PAVIMENTACIÓN CON CONCRETO ECOLÓGICO EN LA CALLE ISLAS DE LAS AVES",
    "tipoObra": "Concreto Ecológico",
    "categoria": "CONCRETOS ECOLOGICOS",
    "fotos": {
        "inicio": f"{base_030}CALLE%20ISLAS%20DE%20LAS%20AVES/INICIO.jpg",
        "proceso": [f"{base_030}CALLE%20ISLAS%20DE%20LAS%20AVES/PROCESO.jpg"],
        "terminado": f"{base_030}CALLE%20ISLAS%20DE%20LAS%20AVES/TERMINADO.jpg"
    },
    "fotosFallback": {
        "inicio": f"{base_030}CALLE%20ISLAS%20DE%20LAS%20AVES/INICIO.jpg",
        "proceso": [f"{base_030}CALLE%20ISLAS%20DE%20LAS%20AVES/PROCESO.jpg"],
        "terminado": f"{base_030}CALLE%20ISLAS%20DE%20LAS%20AVES/TERMINADO.jpg"
    }
}

with open('public/data/evidencias_obras_2025.json', 'w', encoding='utf-8') as f:
    json.dump(ev_2025, f, indent=2, ensure_ascii=False)

print("Saved updated public/data/evidencias_obras_2025.json successfully!")
