import httpx

IA_SERVICE_URL = "http://ml_service:5000/process"

def process_image(image_path: str) -> tuple[str, str]:
    with open(image_path, "rb") as f:
        files = {"file": (image_path, f, "image/jpeg")}
        response = httpx.post(IA_SERVICE_URL, files=files)
        response.raise_for_status()
        data = response.json()
        return data["description"], ",".join(data["tags"])
