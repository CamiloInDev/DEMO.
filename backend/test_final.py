import httpx, time
c = httpx.Client()
for i in range(15):
    r = c.post("http://localhost:8000/api/auth/register", json={"email":f"rr{i}@t.com","password":"123456","full_name":"T"})
    if r.status_code == 429:
        print(f"Rate limited after {i+1} register attempts")
        break
else:
    print("Register: limit not hit")

time.sleep(1)
c2 = httpx.Client()
for i in range(15):
    r = c2.post("http://localhost:8000/api/auth/login", json={"email":"test@test.com","password":"123456"})
    if r.status_code == 429:
        print(f"Login rate limited after {i+1} attempts")
        break
else:
    print("Login: limit not hit")
