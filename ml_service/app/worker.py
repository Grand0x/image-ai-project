import os
import torch
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from transformers import AutoProcessor, Llama4ForConditionalGeneration
from PIL import Image
import tempfile

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Charger les variables d'environnement
HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY")
if not HUGGINGFACE_API_KEY:
    raise EnvironmentError("La variable d'environnement HUGGINGFACE_API_KEY n'est pas définie.")

# Définir l'ID du modèle
model_id = "meta-llama/Llama-4-Maverick-17B-128E-Instruct"

# Initialiser le processeur et le modèle
processor = AutoProcessor.from_pretrained(model_id, token=HUGGINGFACE_API_KEY)
model = Llama4ForConditionalGeneration.from_pretrained(
    model_id,
    attn_implementation="flex_attention",
    device_map="auto",
    torch_dtype=torch.bfloat16,
    token=HUGGINGFACE_API_KEY
)

@app.post("/process")
async def process(file: UploadFile = File(...)):
    try:
        # Sauvegarder temporairement l'image
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name

        # Ouvrir l'image
        image = Image.open(tmp_path).convert("RGB")

        # Préparer le message pour le modèle
        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "image", "image": image},
                    {"type": "text", "text": (
                        "Voici une image. Veuillez fournir une description détaillée de cette image "
                        "et extraire une liste de tags pertinents, séparés par des virgules."
                    )}
                ]
            }
        ]

        # Appliquer le modèle
        inputs = processor.apply_chat_template(
            messages,
            add_generation_prompt=True,
            return_tensors="pt",
            return_dict=True
        ).to(model.device)

        outputs = model.generate(
            **inputs,
            max_new_tokens=512,
            do_sample=False
        )

        response = processor.batch_decode(outputs[:, inputs["input_ids"].shape[-1]:])[0]

        # Extraire la description et les tags
        if "Tags :" in response:
            description_part, tags_part = response.split("Tags :", 1)
            description = description_part.replace("Description :", "").strip()
            tags = [tag.strip() for tag in tags_part.strip().split(",")]
        else:
            description = response.strip()
            tags = []

        return {"description": description, "tags": tags}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
