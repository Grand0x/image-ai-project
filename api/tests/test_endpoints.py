import requests

KEYCLOAK_TOKEN_URL = "http://localhost:8080/realms/image-ai/protocol/openid-connect/token"
API_BASE_URL = "http://localhost:8000"
CLIENT_ID = "fastapi-backend"
CLIENT_SECRET = "my-secret"
USERNAME = "testuser"
PASSWORD = "testpassword"


def get_token():
    data = {
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "grant_type": "password",
        "username": USERNAME,
        "password": PASSWORD
    }
    response = requests.post(KEYCLOAK_TOKEN_URL, data=data)
    response.raise_for_status()
    return response.json()["access_token"]


def test_upload_and_search():
    token = get_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Test upload
    with open("tests/sample.jpg", "rb") as img:
        files = {"file": ("sample.jpg", img, "image/jpeg")}
        resp = requests.post(f"{API_BASE_URL}/upload", headers=headers, files=files)
        assert resp.status_code == 200
        data = resp.json()
        assert "description" in data
        assert "tags" in data

    # Test search
    first_tag = data["tags"].split(",")[0]
    resp = requests.get(f"{API_BASE_URL}/search?q={first_tag}", headers=headers)
    assert resp.status_code == 200
    results = resp.json()
    assert any(first_tag in r["tags"] for r in results)


if __name__ == "__main__":
    test_upload_and_search()
    print("✅ All tests passed!")