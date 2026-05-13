import httpx
# Test rate limit on login (10/min)
c = httpx.Client()
for i in range(12):
    r = c.post("http://localhost:8000/api/auth/login", json={"email":"x@x.com","password":"x"})
    if r.status_code == 429:
        print(f"Rate limited after {i} requests")
        break
print("Done: rate limiting active" if r.status_code==429 else "Rate limit not triggered")
