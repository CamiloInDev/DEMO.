import httpx

# 1. Test password min length
r = httpx.post("http://localhost:8000/api/auth/register", json={"email":"test@t.com","password":"123","full_name":"T"})
print("1. Password too short:", r.status_code, "OK" if r.status_code == 422 else "FAIL")
print("   ", r.json()["detail"][0]["msg"] if r.status_code == 422 else "no error")

# 2. Register properly
r = httpx.post("http://localhost:8000/api/auth/register", json={"email":"user@market.com","password":"12345678","full_name":"Test User"})
token = r.json().get("access_token","")
print("2. Register:", r.status_code, "OK" if r.status_code == 201 else "FAIL")

# 3. Add to cart (should require auth)
r = httpx.post("http://localhost:8000/api/cart", json={"product_id":1,"quantity":1})
print("3. Cart without auth:", r.status_code, "OK(401)" if r.status_code == 401 else "FAIL")

# 4. Add to cart WITH auth
headers = {"Authorization": f"Bearer {token}"}
r = httpx.post("http://localhost:8000/api/cart", json={"product_id":1,"quantity":1}, headers=headers)
print("4. Cart with auth:", r.status_code, "OK" if r.status_code == 201 else "FAIL")
cart_id = r.json().get("id","")

# 5. List cart (should return only user items)
r = httpx.get("http://localhost:8000/api/cart", headers=headers)
print("5. Cart list:", r.status_code, f"{len(r.json())} items", "OK" if r.status_code == 200 else "FAIL")

# 6. Verify CORS headers
r = httpx.options("http://localhost:8000/api/products")
print("6. CORS origin:", r.headers.get("access-control-allow-origin","none"), "OK(fixed)" if "5173" in r.headers.get("access-control-allow-origin","") else "FAIL")
