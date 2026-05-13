import httpx, re
c = httpx.Client()
r = c.get("http://localhost:8000/admin/login")
print("Has form:", 'form' in r.text)
tokens = re.findall(r"name=\"_csrf\".*?value=\"([^\"]+)\"", r.text)
print("CSRF tokens found:", len(tokens))
if tokens:
    r2 = c.post("http://localhost:8000/admin/login", data={"username":"admin@market.com","password":"admin123","_csrf":tokens[0]}, follow_redirects=True)
    print("Login result:", r2.status_code, "/login" not in str(r2.url))
    r3 = c.get("http://localhost:8000/admin/product/list", follow_redirects=True)
    print("Product list:", r3.status_code, "Has table:" if "table" in r3.text else "No table")
