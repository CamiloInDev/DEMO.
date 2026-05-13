import httpx
# Register a user
r = httpx.post("http://localhost:8000/api/auth/register", json={"email":"u@m.com","password":"12345678","full_name":"U"})
token = r.json()["access_token"]
print("Register:", r.status_code)
# Cart without auth
r = httpx.post("http://localhost:8000/api/cart", json={"product_id":1,"quantity":1})
print("Cart no auth:", r.status_code, "(expected 401)" if r.status_code==401 else "FAIL")
# Cart with auth
r = httpx.post("http://localhost:8000/api/cart", json={"product_id":1,"quantity":1}, headers={"Authorization":f"Bearer {token}"})
print("Cart auth:", r.status_code, "(expected 201)" if r.status_code==201 else "FAIL")
# Cart list with auth
r = httpx.get("http://localhost:8000/api/cart", headers={"Authorization":f"Bearer {token}"})
print("Cart list:", r.status_code, f"({len(r.json())} items)" if r.status_code==200 else "FAIL")
# Password too short
r = httpx.post("http://localhost:8000/api/auth/register", json={"email":"x@x.com","password":"123","full_name":"X"})
print("Password short:", r.status_code, "(expected 422)" if r.status_code==422 else "FAIL")
