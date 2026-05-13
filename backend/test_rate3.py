import httpx, time
c = httpx.Client()
success = 0
for i in range(20):
    r = c.post("http://localhost:8000/api/auth/register", json={"email":f"rl{i}@t.com","password":"123456","full_name":"T"})
    if r.status_code == 429:
        print(f"Rate limited at attempt {i+1}")
        break
    success += 1
else:
    print(f"No rate limit after {success} requests")

# Reset for login test
time.sleep(1)
c2 = httpx.Client()
success = 0
for i in range(20):
    r = c2.post("http://localhost:8000/api/auth/login", json={"email":"test@test.com","password":"123456"})
    if r.status_code == 429:
        print(f"Login rate limited at attempt {i+1}")
        break
    if r.status_code == 401:
        success += 1
else:
    print(f"No login rate limit after {success} requests")
