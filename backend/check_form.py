import httpx, re
c = httpx.Client()
r = c.get("http://localhost:8000/admin/login")
# Print form content
m = re.search(r"<form[^>]*>.*?</form>", r.text, re.DOTALL)
if m: print(m.group()[:500])
