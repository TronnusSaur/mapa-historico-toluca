import json
import re

with open('public/data/obras_tramos_supabase.json', 'r', encoding='utf-8') as f:
    tramos_raw = json.load(f)

with open('public/data/obras_puntuales_supabase.json', 'r', encoding='utf-8') as f:
    puntuales_raw = json.load(f)

with open('public/data/evidencias_obras_2025.json', 'r', encoding='utf-8') as f:
    ev_2025 = json.load(f)

with open('public/data/evidencias_obras_2026.json', 'r', encoding='utf-8') as f:
    ev_2026 = json.load(f)

# Combine evidencias maps
combined_ev = {}
for k, v in ev_2025.items():
    combined_ev[k] = v
for k, v in ev_2026.items():
    combined_ev[k] = v

def get_val(row, keys):
    for k in keys:
        if k in row and row[k] is not None and str(row[k]).strip():
            return row[k]
    for rk in row.keys():
        for k in keys:
            if rk.lower().strip() == k.lower().strip() and row[rk] is not None and str(row[rk]).strip():
                return row[rk]
    return None

# Build lookup indices exactly like vincularEvidenciasAObras
by_id = {}
by_no = {}
by_lpn = {}

for ev_key, ev in combined_ev.items():
    idc = ev.get('idContrato')
    if idc:
        by_id[idc.upper().strip()] = ev
        clean_id = re.sub(r'[\s/_-]+', '-', idc.upper().strip())
        by_no[clean_id] = ev
    noc = ev.get('noContrato')
    if noc:
        clean_no = re.sub(r'[\s/_-]+', '-', noc.upper().strip())
        by_no[clean_no] = ev
        m = re.search(r'LPN[-\s/]*(\d+)[-\s/]*(\d{4})', noc, re.IGNORECASE)
        if m:
            num = int(m.group(1))
            yr = m.group(2)
            by_lpn[f"LPN-{num}-{yr}"] = ev
            by_lpn[f"LPN-{num:03d}-{yr}"] = ev
            by_lpn[f"LPN-{m.group(1)}-{yr}"] = ev

def match_evidencia(contrato, id_contrato, nombre):
    matched = None
    if id_contrato and id_contrato.upper().strip() in by_id:
        matched = by_id[id_contrato.upper().strip()]
    if not matched and contrato:
        clean_c = re.sub(r'[\s/_-]+', '-', contrato.upper().strip())
        matched = by_no.get(clean_c)
    if not matched and contrato:
        m = re.search(r'LPN[-\s/]*(\d+)[-\s/]*(\d{4})', contrato, re.IGNORECASE)
        if m:
            num = int(m.group(1))
            yr = m.group(2)
            matched = by_lpn.get(f"LPN-{num}-{yr}") or by_lpn.get(f"LPN-{num:03d}-{yr}") or by_lpn.get(f"LPN-{m.group(1)}-{yr}")
    if not matched and nombre:
        un = nombre.upper()
        if 'LAS JARAS' in un or 'BARRANCA GRANDE' in un:
            matched = by_id.get('FENA-097')
        elif 'SEÑALAMIENTO' in un or 'SENALAMIENTO' in un:
            matched = by_id.get('VIFUD-049')
    return matched

def count_photos(matched):
    if not matched:
        return 0, 0, 0, 0
    f = matched.get('fotosFallback') or matched.get('fotos') or {}
    f_orig = matched.get('fotos') or {}
    
    inicio = 1 if (f.get('inicio') or f_orig.get('inicio')) else 0
    
    proc_set = set()
    for p in (f.get('proceso') or []):
        if p: proc_set.add(p)
    for p in (f_orig.get('proceso') or []):
        if p: proc_set.add(p)
    proceso = len(proc_set)
    
    terminado = 1 if (f.get('terminado') or f_orig.get('terminado')) else 0
    total = inicio + proceso + terminado
    return inicio, proceso, terminado, total

# Parse Tramos
tramos_parsed = []
for idx, row in enumerate(tramos_raw):
    raw_contrato = get_val(row, ['No. Contrato', 'contrato', 'no_contrato'])
    tipo_raw = get_val(row, ['Tipo de Obra', 'tipo', 'tipo_obra']) or ''
    contrato = (raw_contrato.strip() if raw_contrato else f"OBRA-TRAMO #{idx+1}")
    nombre = get_val(row, ['Nombre de la Obra', 'nombre', 'descripcion', 'obra']) or ''
    id_c = get_val(row, ['idContrato', 'id_contrato'])
    
    anio = 2026
    if '/2025' in contrato or '-2025' in contrato:
        anio = 2025
    elif '/2027' in contrato or '-2027' in contrato:
        anio = 2027
        
    matched = match_evidencia(contrato, id_c, nombre)
    i, p, t, tot = count_photos(matched)
    
    tramos_parsed.append({
        'idx': idx + 1,
        'contrato': contrato,
        'idContrato': id_c,
        'tipo': tipo_raw,
        'nombre': nombre,
        'anio': anio,
        'inicio': i,
        'proceso': p,
        'terminado': t,
        'total': tot,
        'categoria': matched.get('categoria') if matched else None
    })

# Parse Puntuales
puntuales_parsed = []
for idx, row in enumerate(puntuales_raw):
    raw_contrato = get_val(row, ['No. Contrato', 'contrato', 'no_contrato'])
    tipo_raw = get_val(row, ['Tipo de Obra', 'tipo', 'tipo_obra']) or ''
    contrato = (raw_contrato.strip() if raw_contrato else f"OBRA-PUNTUAL #{idx+1}")
    nombre = get_val(row, ['Nombre de la Obra', 'nombre', 'descripcion', 'obra']) or ''
    id_c = get_val(row, ['idContrato', 'id_contrato'])
    
    anio = 2026
    if '/2025' in contrato or '-2025' in contrato:
        anio = 2025
    elif '/2027' in contrato or '-2027' in contrato:
        anio = 2027
        
    matched = match_evidencia(contrato, id_c, nombre)
    i, p, t, tot = count_photos(matched)
    
    puntuales_parsed.append({
        'idx': idx + 1,
        'contrato': contrato,
        'idContrato': id_c,
        'tipo': tipo_raw,
        'nombre': nombre,
        'anio': anio,
        'inicio': i,
        'proceso': p,
        'terminado': t,
        'total': tot,
        'categoria': matched.get('categoria') if matched else None
    })

# Summary
tramos_2025 = [t for t in tramos_parsed if t['anio'] == 2025]
tramos_2026 = [t for t in tramos_parsed if t['anio'] == 2026]
puntuales_2025 = [p for p in puntuales_parsed if p['anio'] == 2025]
puntuales_2026 = [p for p in puntuales_parsed if p['anio'] == 2026]

print(f"Tramos 2025: {len(tramos_2025)} obras")
print(f"Tramos 2026: {len(tramos_2026)} obras")
print(f"Puntuales 2025: {len(puntuales_2025)} obras")
print(f"Puntuales 2026: {len(puntuales_2026)} obras")

# Save structured summary to JSON
result = {
    'tramos_2025': tramos_2025,
    'tramos_2026': tramos_2026,
    'puntuales_2025': puntuales_2025,
    'puntuales_2026': puntuales_2026
}
with open('scripts/obras_evidencias_summary.json', 'w', encoding='utf-8') as f:
    json.dump(result, f, indent=2, ensure_ascii=False)

print("\nSaved summary to scripts/obras_evidencias_summary.json")
