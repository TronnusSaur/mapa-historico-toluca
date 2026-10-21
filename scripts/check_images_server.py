import urllib.request
import re

base = 'https://imagenes.soranoserver.com/imagenes/'

def get_dir(url):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as r:
            html = r.read().decode('utf-8', errors='ignore')
            links = re.findall(r'href="([^"]+)"', html)
            return [l for l in links if not l.startswith('?') and l != '../']
    except Exception as e:
        return f"Error: {e}"

print("Root /imagenes/:", get_dir(base))
print("\nEVIDENCIAS 2026:", get_dir(base + 'EVIDENCIAS%20DE%20OBRAS%202026/'))
print("\nEVIDENCIAS 2025:", get_dir(base + 'EVIDENCIAS%20DE%20OBRAS%202025/'))
