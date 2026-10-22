import json
import urllib.parse
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('public/data/evidencias_obras_2025.json', 'r', encoding='utf-8') as f:
    ev_2025 = json.load(f)

print(f"Total 2025 entries in manifest: {len(ev_2025)}")

# Let's inspect what is in scripts/scan_deep_images.py output for 2025
# Or scan 2025 directly with a quick script
