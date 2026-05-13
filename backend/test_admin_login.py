import httpx
# Test login
with httpx.Client() as c:
    # Get login page
    r = c.get("http://localhost:8000/admin/login", follow_redirects=True)
    print("Login page:", r.status_code)
    # Get CSRF token
    import re
    token = re.search(r'name="_csrf"[^>]*value="([^"]*)"', r.text)
    if token:
        # Login
        r2 = c.post("http://localhost:8000/admin/login", data={
            "username": "admin@market.com",
            "password": "admin123",
            "_csrf": token.group(1),
        }, follow_redirects=True)
        print("After login:", r2.status_code, str(r2.url))
        print("Authed:", "product/list" in str(r2.url))
