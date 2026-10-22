import json

with open('scripts/obras_evidencias_summary.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

def clean_desc(name):
    if not name: return ''
    # Remove extra spaces/newlines
    s = ' '.join(name.split())
    # Keep up to 60 chars
    if len(s) > 60:
        return s[:57] + '...'
    return s

for section in ['tramos_2026', 'puntuales_2026', 'tramos_2025', 'puntuales_2025']:
    items = data[section]
    print(f"\n============================== {section.upper()} ({len(items)}) ==============================")
    for it in items:
        c = it['contrato']
        tipo = it['tipo'][:20]
        desc = clean_desc(it['nombre'])
        tot = it['total']
        i = it['inicio']
        p = it['proceso']
        t = it['terminado']
        print(f"[{c}] ({tipo}) | Tot:{tot} (Ini:{i}, Proc:{p}, Term:{t}) | {desc}")
