import tempfile, os
import httpx, jwt
from fastapi import Depends, HTTPException, status, Header
from jose import jwk, jwt as jose_jwt
from jose.utils import base64url_decode
from typing import Optional

KEYCLOAK_URL = "http://keycloak:8080/realms/image-ai"
ALGORITHM = "RS256"

_jwks = None

def save_image_temp(filename: str, content: bytes) -> str:
    temp_dir = tempfile.gettempdir()
    temp_path = os.path.join(temp_dir, filename)
    with open(temp_path, "wb") as f:
        f.write(content)
    return temp_path

async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")

    token = authorization.split(" ")[1]
    global _jwks

    if not _jwks:
        try:
            resp = httpx.get(f"{KEYCLOAK_URL}/protocol/openid-connect/certs")
            resp.raise_for_status()
            _jwks = resp.json()["keys"]
        except Exception:
            raise HTTPException(status_code=500, detail="Unable to fetch JWKS")

    try:
        headers = jwt.get_unverified_header(token)
        kid = headers["kid"]
        key = next((k for k in _jwks if k["kid"] == kid), None)
        if not key:
            raise Exception("Matching key not found")

        public_key = jwk.construct(key)
        message, encoded_sig = token.rsplit(".", 1)
        decoded_sig = base64url_decode(encoded_sig.encode())

        if not public_key.verify(message.encode(), decoded_sig):
            raise Exception("Signature verification failed")

        payload = jose_jwt.decode(token, public_key.to_pem().decode(), algorithms=[ALGORITHM], audience="account")
        return payload

    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")