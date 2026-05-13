import httpx
r = httpx.post("http://localhost:8000/api/auth/register", json={"email":"test@test.com","password":"123456","full_name":"Test"})
print("Register:", r.status_code, r.json().get("access_token","")[:30])
token = r.json()["access_token"]
r2 = httpx.get("http://localhost:8000/api/users/me", headers={"Authorization": f"Bearer {token}"})
print("Me:", r2.status_code, r2.json().get("email",""))
