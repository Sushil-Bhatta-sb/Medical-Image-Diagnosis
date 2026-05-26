import os
import django
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path('.') / '.env')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

import jwt
from django.conf import settings

secret = settings.SUPABASE_JWT_SECRET
print("Secret:", secret[:30] if secret else "NONE")

# Paste your token below
token = "eyJhbGciOiJFUzI1NiIsImtpZCI6IjQ4YzdhZGYzLWY5ZTEtNDM0Ny1iMzdkLTk4MjJhZDJjMWQyMCIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3pmdnJweXhjam93emZhaXhjdnNvLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI4Zjc5ZTBjZC03MGI2LTQ1ZTctODE2ZS1hNTliM2Y0NmZmZmEiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzgwMzk5MjAyLCJpYXQiOjE3Nzk3OTQ0MDIsImVtYWlsIjoiYmhhdHRzdXNoaWw1NTY3QGdtYWlsLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZW1haWxfdmVyaWZpZWQiOnRydWV9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6InBhc3N3b3JkIiwidGltZXN0YW1wIjoxNzc5Nzk0NDAyfV0sInNlc3Npb25faWQiOiI4NDllNWI5NC0xM2I1LTQ2OWYtOTFkZC0zY2EzMGRkZTFhMmYiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.GQ1ioFgxiRqmBRpFMeAZ5BV5GJDg1WjF5NLUGB8m4JCHG2PYVTs7w3JbwSc8TVqvBBAw-2FmCAzssvRgk_RNNw"

try:
    payload = jwt.decode(
        token,
        secret,
        algorithms=['HS256'],
        options={"verify_aud": False}
    )
    print("SUCCESS:", payload.get('email'))
except Exception as e:
    print("FAILED:", type(e).__name__, str(e))