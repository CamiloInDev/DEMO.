import httpx, re
r = httpx.get("http://localhost:8000/admin", follow_redirects=True)
# Find CDN URLs
cdns = re.findall(r'(https?://[^"\'\s]*(?:cdn|cloudflare|bootstrap|tabler)[^"\'\s]*)', r.text, re.I)
print("CDN URLs found:", len(cdns))
for c in cdns[:5]: print(" ", c)
