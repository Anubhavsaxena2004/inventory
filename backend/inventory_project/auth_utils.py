import base64
import hmac
import hashlib
import json
import time
from django.conf import settings

HEADER = {"alg": "HS256", "typ": "JWT"}

def _b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")

def _b64url_decode(data: str) -> bytes:
    padding = '=' * ((4 - len(data) % 4) % 4)
    return base64.urlsafe_b64decode((data + padding).encode('ascii'))

def generate_jwt(payload: dict, exp_seconds: int = 24*3600) -> str:
    header = _b64url(json.dumps(HEADER, separators=(',', ':')).encode('utf-8'))
    now = int(time.time())
    pl = dict(payload)
    pl.setdefault('iat', now)
    pl['exp'] = now + exp_seconds
    body = _b64url(json.dumps(pl, separators=(',', ':')).encode('utf-8'))
    signing_input = f"{header}.{body}".encode('ascii')
    signature = hmac.new(settings.SECRET_KEY.encode('utf-8'), signing_input, hashlib.sha256).digest()
    sig = _b64url(signature)
    return f"{header}.{body}.{sig}"

def verify_jwt(token: str) -> dict | None:
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None
        header_b64, body_b64, sig_b64 = parts
        signing_input = f"{header_b64}.{body_b64}".encode('ascii')
        expected = hmac.new(settings.SECRET_KEY.encode('utf-8'), signing_input, hashlib.sha256).digest()
        if _b64url(expected) != sig_b64:
            return None
        payload = json.loads(_b64url_decode(body_b64))
        if int(time.time()) > int(payload.get('exp', 0)):
            return None
        return payload
    except Exception:
        return None

def get_auth_payload_from_request(request) -> dict | None:
    auth = request.headers.get('Authorization') or ''
    if auth.startswith('Bearer '):
        token = auth[len('Bearer '):]
        return verify_jwt(token)
    return None

def is_admin_request(request) -> bool:
    payload = get_auth_payload_from_request(request)
    return bool(payload and payload.get('is_admin') is True)

