import httpx
# Test register limit (5/min)
c = httpx.Client()
for i in range(8):
    r = c.post("http://localhost:8000/api/auth/register", json={"email":f"test{i}@test.com","password":"123456","full_name":"T"})
    if r.status_code == 429:
        print(f"Register rate limited after {i} requests: {r.text[:50]}")
        break
else:
    print("Register: rate limit not hit (status:", r.status_code, ")")
# Test login limit (10/min)
c2 = httpx.Client()
for i in range(14):
    r = c2.post("http://localhost:8000/api/auth/login", json={"email":"x@x.com","password":"x"})
    if r.status_code == 429:
        print(f"Login rate limited after {i} requests")
        break
else:
    print("Login: rate limit not hit")
