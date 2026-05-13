import httpx, re
r = httpx.get("http://localhost:8000/admin/product/list", follow_redirects=True)
# Find all <a> with "create"
links = re.findall(r'href="([^"]*create[^"]*)"', r.text, re.I)
print("Create links:", links)
# Find button-like text near "Add" or "Nuevo"
matches = re.findall(r'(?:btn|button|class="[^"]*btn[^"]*")[^<]*([^<>]*?(?:Add|New|Crear|Nuevo|Añadir)[^<>]*)', r.text, re.I)
print("Buttons:", matches[:3])
# Check if there's any form to create
has_form = '<form' in r.text and ('/create' in r.text or '/edit' in r.text)
print("Has create/edit form:", has_form)
