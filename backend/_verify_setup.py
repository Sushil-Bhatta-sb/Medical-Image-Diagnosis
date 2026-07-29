import os
import jwt
import requests
from dotenv import load_dotenv

load_dotenv(r"d:\Medical-Image-Diagnosis\backend\.env")
URL = os.environ["SUPABASE_URL"]
ANON = os.environ["SUPABASE_KEY"]
SVC = os.environ["SUPABASE_SERVICE_KEY"]
EMAIL = "tester@example.com"
PW = "Test1234!"

sh = {"Authorization": f"Bearer {SVC}", "apikey": SVC, "Content-Type": "application/json"}

r = requests.post(f"{URL}/storage/v1/bucket", headers=sh,
                  json={"id": "xray-images", "name": "xray-images", "public": True}, timeout=20)
print("BUCKET", r.status_code, r.text[:180])

r = requests.post(f"{URL}/auth/v1/admin/users", headers=sh,
                  json={"email": EMAIL, "password": PW, "email_confirm": True}, timeout=20)
print("CREATEUSER", r.status_code, r.text[:180])

r = requests.post(f"{URL}/auth/v1/token?grant_type=password",
                  headers={"apikey": ANON, "Content-Type": "application/json"},
                  json={"email": EMAIL, "password": PW}, timeout=20)
print("SIGNIN", r.status_code, r.text[:120])
tok = r.json().get("access_token")
print("TOKEN ALG:", jwt.get_unverified_header(tok).get("alg") if tok else "NONE")

import time
claims = jwt.decode(tok, options={"verify_signature": False})
now = int(time.time())
print("SKEW: iat", claims["iat"], "now", now, "iat-now", claims["iat"] - now, "exp_in", claims["exp"] - now)

h = {"Authorization": f"Bearer {tok}"}
for p in ["/api/auth/profile/", "/api/predictions/history/", "/api/analytics/user-stats/"]:
    rr = requests.get("http://127.0.0.1:8000" + p, headers=h, timeout=20)
    print("GET", p, rr.status_code, rr.text[:120])

rr = requests.post("http://127.0.0.1:8000/api/predictions/",
                   headers={**h, "Content-Type": "application/json"},
                   json={"image_url": "https://example.com/x.png"}, timeout=20)
print("POST /api/predictions/", rr.status_code, rr.text[:120])
