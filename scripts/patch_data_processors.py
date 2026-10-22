with open('src/utils/dataProcessors.ts', 'r', encoding='utf-8') as f:
    text = f.read()

target = """      if (upperNombre.includes('LAS JARAS') || upperNombre.includes('BARRANCA GRANDE')) {
        matchedEv = byId.get('FENA-097');
      } else if (upperNombre.includes('SEÑALAMIENTO') || upperNombre.includes('SENALAMIENTO')) {
        matchedEv = byId.get('VIFUD-049');
      }"""

# Normalize target to whatever line endings the file has
if '\r\n' in text and '\r\n' not in target:
    target = target.replace('\n', '\r\n')

replacement = """      if (upperNombre.includes('LAS JARAS') || upperNombre.includes('BARRANCA GRANDE')) {
        matchedEv = byId.get('FENA-097');
      } else if (upperNombre.includes('SEÑALAMIENTO') || upperNombre.includes('SENALAMIENTO')) {
        matchedEv = byId.get('VIFUD-049');
      } else if (upperNombre.includes('PARQUE NEVADO')) {
        matchedEv = byId.get('MT-DGOP-FAISMUN-LPN-030-2025');
      } else if (upperNombre.includes('POPOCATÉPETL') || upperNombre.includes('POPOCATEPETL')) {
        matchedEv = byId.get('LPN-030-2025-POPOCATEPETL');
      } else if (upperNombre.includes('ISLAS DE LAS AVES')) {
        matchedEv = byId.get('LPN-030-2025-AVES');
      } else if (upperNombre.includes('CUAUHTÉMOC') || upperNombre.includes('ALAMEDA')) {
        matchedEv = byId.get('MT-DGOP-IPDM-LPN-045-2025');
      } else if (upperNombre.includes('CANAL') || upperNombre.includes('EMILIANO ZAPATA')) {
        matchedEv = byId.get('MT-DGOP-IPDM-LPN-003-2025');
      } else if (upperNombre.includes('CAJA DERIVADORA') || upperNombre.includes('JUAN FERNÁNDEZ ALBARRÁN') || upperNombre.includes('JUAN FERNANDEZ')) {
        matchedEv = byId.get('MT-DGOP-IPDM-LPN-002-2025');
      } else if (upperNombre.includes('INDUSTRIAS QUÍMICAS') || upperNombre.includes('INDUSTRIAS QUIMICAS')) {
        matchedEv = byId.get('MT-DGOP-IPDM-LPN-004-2025');
      } else if (upperNombre.includes('JUAN ESCUTIA') || upperNombre.includes('CRESPA- FLORESTA') || upperNombre.includes('CRESPA FLORESTA')) {
        matchedEv = byId.get('MT-DGOP-AVGFYD-LP-001-2025');
      }"""

if '\r\n' in text and '\r\n' not in replacement:
    replacement = replacement.replace('\n', '\r\n')

if target in text:
    text = text.replace(target, replacement)
    with open('src/utils/dataProcessors.ts', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Replaced successfully in src/utils/dataProcessors.ts!")
else:
    print("Target not found!")
