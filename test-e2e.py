import requests
import sys
import argparse

def exit_error(message):
    print(f"❌ ERROR: {message}")
    sys.exit(1)

def main(image_path):
    # Configuration
    host_api       = "http://localhost:8000"
    host_ml        = "http://localhost:5000"
    kc_host        = "http://localhost:8080"
    realm          = "image-ai"
    client_id      = "fastapi-backend"
    client_secret  = "my-secret"
    user           = "testuser"
    password       = "testpassword"

    # 1. Obtain Keycloak token
    print("=== 1. Obtaining Keycloak token ===")
    token_url = f"{kc_host}/realms/{realm}/protocol/openid-connect/token"
    data = {
        "client_id": client_id,
        "client_secret": client_secret,
        "grant_type": "password",
        "username": user,
        "password": password
    }
    resp = requests.post(token_url, data=data)
    if resp.status_code != 200:
        exit_error(f"Token request failed ({resp.status_code}): {resp.text}")
    token = resp.json().get("access_token")
    if not token:
        exit_error("No access_token in response.")
    print("Token obtained.")

    # 2. Test /me endpoint
    print("\\n=== 2. Testing /me endpoint ===")
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.get(f"{host_api}/me", headers=headers)
    if resp.status_code != 200:
        exit_error(f"/me failed ({resp.status_code}): {resp.text}")
    print("ME response:", resp.json())

    # 3. Upload image
    print("\\n=== 3. Uploading image ===")
    with open(image_path, "rb") as img_file:
        files = {"file": img_file}
        resp = requests.post(f"{host_api}/upload", headers=headers, files=files)
    if resp.status_code != 200:
        exit_error(f"Upload failed ({resp.status_code}): {resp.text}")
    upload_data = resp.json()
    print("Upload response:", upload_data)

    # 4. Search by first tag
    print("\\n=== 4. Searching with first tag ===")
    tags = upload_data.get("tags", [])
    if not tags:
        exit_error("No tags returned.")
    first_tag = tags[0]
    resp = requests.get(f"{host_api}/search", headers=headers, params={"q": first_tag})
    if resp.status_code != 200:
        exit_error(f"Search failed ({resp.status_code}): {resp.text}")
    print("Search results:", resp.json())

    # 5. Direct worker IA test
    print("\\n=== 5. Testing worker IA ===")
    with open(image_path, "rb") as img_file:
        files = {"file": img_file}
        resp = requests.post(f"{host_ml}/process", files=files)
    if resp.status_code != 200:
        exit_error(f"Worker IA failed ({resp.status_code}): {resp.text}")
    print("Worker IA response:", resp.json())

    # 6. Second upload to test cache
    print("\\n=== 6. Second upload (cache check) ===")
    with open(image_path, "rb") as img_file:
        files = {"file": img_file}
        resp = requests.post(f"{host_api}/upload", headers=headers, files=files)
    if resp.status_code != 200:
        exit_error(f"Second upload failed ({resp.status_code}): {resp.text}")
    second_data = resp.json()
    if second_data.get("hash") == upload_data.get("hash"):
        print("Cache OK: same hash returned.")
    else:
        print("Warning: different hash on second upload.", second_data.get("hash"))

    print("\\n🎉 All manual tests passed successfully!")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="End-to-end manual test script")
    parser.add_argument("--image", default="tests/bike.jpg", help="Path to the image file")
    args = parser.parse_args()
    main(args.image)