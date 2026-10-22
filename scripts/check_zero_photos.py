import json

with open('scripts/obras_evidencias_summary.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for section, items in data.items():
    zero_photos = [x for x in items if x['total'] == 0]
    print(f"\n=== {section.upper()}: {len(zero_photos)} obras con 0 fotos ===")
    for z in zero_photos:
        print(f"  * Contrato: {z['contrato']}")
        print(f"    Tipo: {z['tipo']}")
        print(f"    Nombre: {z['nombre']}")

# Also let's check if any 2026 obra is missing Terminado or Proceso
print("\n=== 2026 OBRAS QUE NO TIENEN FOTO DE TERMINADO AUN ===")
for section in ['tramos_2026', 'puntuales_2026']:
    sin_terminado = [x for x in data[section] if x['terminado'] == 0]
    print(f"{section}: {len(sin_terminado)} obras sin foto de terminado")
    for s in sin_terminado:
        print(f"  * [{s['contrato']}] (Ini:{s['inicio']}, Proc:{s['proceso']}, Term:0) - {s['nombre'][:70]}...")
