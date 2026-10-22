import json

with open('public/data/evidencias_obras_2026.json', 'r', encoding='utf-8') as f:
    ev = json.load(f)

# 1. Update ICI-076 with TERMINADO
if 'ICI-076' in ev:
    t_url = "https://imagenes.soranoserver.com/imagenes/EVIDENCIAS%20DE%20OBRAS%202026/SENDEROS%20Y%20PARQUES/MT-DGOP-FAISMUN-LPN-076-2026/TERMINADO.jpeg"
    ev['ICI-076']['fotos']['terminado'] = t_url
    if 'fotosFallback' in ev['ICI-076']:
        ev['ICI-076']['fotosFallback']['terminado'] = t_url
    print("Updated ICI-076 with TERMINADO photo!")

# 2. Update REDNI-074 with TERMINADO
if 'REDNI-074' in ev:
    t_url = "https://imagenes.soranoserver.com/imagenes/EVIDENCIAS%20DE%20OBRAS%202026/TECHADO/MT-DGOP-FAISMUN-LPN-074-2026/TERMINADO.jpeg"
    ev['REDNI-074']['fotos']['terminado'] = t_url
    if 'fotosFallback' in ev['REDNI-074']:
        ev['REDNI-074']['fotosFallback']['terminado'] = t_url
    print("Updated REDNI-074 with TERMINADO photo!")

# 3. Update VIFUD-049 with additional photos
if 'VIFUD-049' in ev:
    base_sen = "https://imagenes.soranoserver.com/imagenes/EVIDENCIAS%20DE%20OBRAS%202026/SE%C3%91ALAMIENTO/SE%C3%91ALAMIENTO%20HORIZONTAL%20Y%20VERTICAL%20EN%20DIVERSAS%20CALLES/"
    ev['VIFUD-049']['fotosFallback']['proceso'] = [
        base_sen + "PROCESO.jpeg",
        base_sen + "PROCESO%20%282%29.jpeg"
    ]
    ev['VIFUD-049']['fotosFallback']['terminado'] = base_sen + "TERMINADO.jpeg"
    print("Updated VIFUD-049 with additional proceso and terminado photos!")

with open('public/data/evidencias_obras_2026.json', 'w', encoding='utf-8') as f:
    json.dump(ev, f, indent=2, ensure_ascii=False)

print("Saved updated public/data/evidencias_obras_2026.json successfully!")
