import os
import re
import json
import urllib.request
import base64
import shutil

# 1. Conectar a Supabase para obtener mapeos y metadata
base_url = 'https://realized-wider-walked-donors.trycloudflare.com'
auth = base64.b64encode(b'supabase:this_password_is_insecure_and_should_be_updated').decode('ascii')
headers = {
    'Authorization': f'Basic {auth}',
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0'
}

def run_sql(sql):
    payload = json.dumps({'query': sql}).encode('utf-8')
    req = urllib.request.Request(base_url + '/api/platform/pg-meta/default/query', data=payload, headers=headers)
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode('utf-8'))

print("Conectando a Supabase contratos_test...")
info_contratos = run_sql('SELECT * FROM contratos_test."infoContratos";')
mapeo_t = run_sql('SELECT "idMapeo_t", "idContrato", "No. Contrato", "Nombre de la Obra", "Tipo de Obra" FROM contratos_test.mapeo_t;')
mapeo_p = run_sql('SELECT "idMapeo_t", "idContrato", "No. Contrato", "Nombre de la Obra", "Tipo de Obra" FROM contratos_test.mapeo_p;')

print(f"Obtenidos: {len(info_contratos)} infoContratos, {len(mapeo_t)} mapeo_t, {len(mapeo_p)} mapeo_p")

# Construir diccionarios de búsqueda
by_lpn = {}
by_clean_contrato = {}
by_id_contrato = {}

for r in info_contratos:
    c_id = r.get('idContrato')
    c_no = r.get('No. Contrato') or ''
    by_id_contrato[c_id] = r
    
    m = re.search(r'LPN[-\s/]*(\d+)[-\s/]*(\d{4})', c_no, re.IGNORECASE)
    if m:
        lpn_key = f"LPN-{m.group(1)}-{m.group(2)}"
        by_lpn[lpn_key] = r
    
    clean_no = re.sub(r'[\s/]+', '-', c_no.upper()).replace('--', '-').strip('-')
    by_clean_contrato[clean_no] = r

for r in mapeo_t + mapeo_p:
    c_no = r.get('No. Contrato') or ''
    c_id = r.get('idContrato')
    m = re.search(r'LPN[-\s/]*(\d+)[-\s/]*(\d{4})', c_no, re.IGNORECASE)
    if m:
        lpn_key = f"LPN-{m.group(1)}-{m.group(2)}"
        if lpn_key not in by_lpn and c_id in by_id_contrato:
            by_lpn[lpn_key] = by_id_contrato[c_id]

# Mapeos especiales conocidos
special_matches = {
    'MT-DGOP-PROAGUA-FAISMUN-LPN-097-2026': 'FENA-097',
    'SEÑALAMIENTO HORIZONTAL Y VERTICAL EN DIVERSAS CALLES': 'VIFUD-049',
    'SEALAMIENTO HORIZONTAL Y VERTICAL EN DIVERSAS CALLES': 'VIFUD-049',
}

base_dir = r'C:\Users\USR\Desktop\EVIDENCIAS DE OBRAS 2026'
tunnel_base = 'https://dependent-max-warcraft-portsmouth.trycloudflare.com/imagenes/EVIDENCIAS%20DE%20OBRAS%202026'

categories = [c for c in os.listdir(base_dir) if os.path.isdir(os.path.join(base_dir, c))]
print(f"Categorías encontradas ({len(categories)}): {categories}")

manifest = {}
server_bash_commands = [
    "#!/bin/bash",
    "# Script de normalización para Servidor Alfa (/imagenes/EVIDENCIAS DE OBRAS 2026/)",
    "cd \"/imagenes/EVIDENCIAS DE OBRAS 2026\" 2>/dev/null || cd \"/var/www/html/imagenes/EVIDENCIAS DE OBRAS 2026\" 2>/dev/null || exit 1",
    ""
]

for cat in sorted(categories):
    cat_dir = os.path.join(base_dir, cat)
    subfolders = [f for f in os.listdir(cat_dir) if os.path.isdir(os.path.join(cat_dir, f))]
    
    for folder in sorted(subfolders):
        folder_path = os.path.join(cat_dir, folder)
        files = [f for f in os.listdir(folder_path) if os.path.isfile(os.path.join(folder_path, f))]
        
        if not files:
            print(f"Carpeta vacía omitida: [{cat}] {folder}")
            continue
            
        matched_id = special_matches.get(folder)
        matched_meta = None
        
        # Si ya está nombrada con un idContrato existente
        if folder in by_id_contrato:
            matched_id = folder
            matched_meta = by_id_contrato[folder]

        if not matched_id:
            m = re.search(r'LPN[-\s/]*(\d+)[-\s/]*(\d{4})', folder, re.IGNORECASE)
            if m:
                lpn_key = f"LPN-{m.group(1)}-{m.group(2)}"
                if lpn_key in by_lpn:
                    matched_meta = by_lpn[lpn_key]
                    matched_id = matched_meta.get('idContrato')
        
        if not matched_id:
            clean_f = re.sub(r'[\s/]+', '-', folder.upper()).replace('--', '-').strip('-')
            if clean_f in by_clean_contrato:
                matched_meta = by_clean_contrato[clean_f]
                matched_id = matched_meta.get('idContrato')
                
        if not matched_id:
            print(f"ALERTA: No se pudo mapear la carpeta: [{cat}] {folder}")
            continue
            
        if matched_id in by_id_contrato:
            matched_meta = by_id_contrato[matched_id]
            
        # 1. Renombrar la carpeta si aún no tiene el nombre idContrato
        target_folder_path = folder_path
        if folder != matched_id:
            new_folder_path = os.path.join(cat_dir, matched_id)
            if os.path.exists(new_folder_path):
                target_folder_path = new_folder_path
            else:
                print(f"Renombrando carpeta: [{cat}] '{folder}' -> '{matched_id}'")
                os.rename(folder_path, new_folder_path)
                target_folder_path = new_folder_path
                
            server_bash_commands.append(f'if [ -d "{cat}/{folder}" ]; then mv "{cat}/{folder}" "{cat}/{matched_id}"; fi')
        
        # 2. Renombrar las fotos a _inicio, _proceso, _terminado
        current_files = sorted([f for f in os.listdir(target_folder_path) if os.path.isfile(os.path.join(target_folder_path, f))])
        
        foto_inicio = None
        fotos_proceso = []
        foto_terminado = None
        
        proceso_count = 0
        for f in current_files:
            f_lower = f.lower()
            name_no_ext, ext = os.path.splitext(f)
            ext = ext.lower()
            if ext not in ['.jpg', '.jpeg', '.png']:
                continue
                
            orig_file_path = os.path.join(target_folder_path, f)
            new_file_name = None
            
            if 'inicio' in f_lower or 'inicial' in f_lower:
                new_file_name = f"_inicio{ext}"
                foto_inicio = new_file_name
            elif 'termin' in f_lower or 'final' in f_lower:
                new_file_name = f"_terminado{ext}"
                foto_terminado = new_file_name
            elif 'proceso' in f_lower:
                proceso_count += 1
                if proceso_count == 1:
                    new_file_name = f"_proceso{ext}"
                else:
                    new_file_name = f"_proceso_{proceso_count}{ext}"
                fotos_proceso.append(new_file_name)
            else:
                proceso_count += 1
                new_file_name = f"_proceso_{proceso_count}{ext}"
                fotos_proceso.append(new_file_name)
                
            if new_file_name and new_file_name != f:
                dest_file_path = os.path.join(target_folder_path, new_file_name)
                if os.path.exists(dest_file_path) and orig_file_path != dest_file_path:
                    os.remove(dest_file_path)
                os.rename(orig_file_path, dest_file_path)
                print(f"   Foto: {f} -> {new_file_name}")
                server_bash_commands.append(f'if [ -f "{cat}/{matched_id}/{f}" ]; then mv "{cat}/{matched_id}/{f}" "{cat}/{matched_id}/{new_file_name}"; fi')
            elif new_file_name == f:
                if 'inicio' in f: foto_inicio = f
                elif 'terminado' in f: foto_terminado = f
                elif 'proceso' in f: 
                    if f not in fotos_proceso: fotos_proceso.append(f)

        import urllib.parse
        encoded_cat = urllib.parse.quote(cat)
        encoded_id = urllib.parse.quote(matched_id)
        
        rel_base = f"{tunnel_base}/{encoded_cat}/{encoded_id}"
        
        manifest[matched_id] = {
            'idContrato': matched_id,
            'noContrato': (matched_meta.get('No. Contrato') if matched_meta else folder) or '',
            'nombreObra': (matched_meta.get('Nombre de la Obra') if matched_meta else '') or '',
            'tipoObra': (matched_meta.get('tipo_obra') if matched_meta else cat) or cat,
            'idEmpresa': (matched_meta.get('idEmpresa') if matched_meta else '') or '',
            'idDelegacion': (matched_meta.get('idDelegacion') if matched_meta else '') or '',
            'montoContratado': (matched_meta.get('Monto Contratado') if matched_meta else '') or '',
            'fechaInicio': (matched_meta.get('Inicio de Ejecucion') if matched_meta else '') or '',
            'fechaFin': (matched_meta.get('Termino de Ejecucion') if matched_meta else '') or '',
            'categoria': cat,
            'fotos': {
                'inicio': f"{rel_base}/{foto_inicio}" if foto_inicio else None,
                'proceso': [f"{rel_base}/{fp}" for fp in fotos_proceso] if fotos_proceso else [],
                'terminado': f"{rel_base}/{foto_terminado}" if foto_terminado else None,
            }
        }

manifest_path = r'c:\Users\USR\Desktop\Proyectos AG\Mapa Histórico\public\data\evidencias_obras_2026.json'
os.makedirs(os.path.dirname(manifest_path), exist_ok=True)
with open(manifest_path, 'w', encoding='utf-8') as f:
    json.dump(manifest, f, ensure_ascii=False, indent=2)

print(f"\nManifiesto generado exitosamente en: {manifest_path}")
print(f"Total contratos en manifiesto: {len(manifest)}")

bash_path = r'c:\Users\USR\Desktop\Proyectos AG\Mapa Histórico\scripts\normalize_server_alfa.sh'
os.makedirs(os.path.dirname(bash_path), exist_ok=True)
with open(bash_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(server_bash_commands) + '\n')
print(f"Script bash para servidor Alfa guardado en: {bash_path}")
