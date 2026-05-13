import httpx
c = httpx.Client()
# Login
c.post("http://localhost:8000/admin/login", data={"username":"admin@market.com","password":"admin123"}, follow_redirects=True)
# Try getting product list
r = c.get("http://localhost:8000/admin/product/list", follow_redirects=True)
print("Product list:", r.status_code, str(r.url)[:60])
