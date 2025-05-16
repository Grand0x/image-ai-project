# Projet Image AI Recognition

Ce projet propose une application backend complète pour l’analyse, l’indexation et la recherche d’images à l’aide de modèles d’IA. L’utilisateur peut envoyer une image, obtenir automatiquement une description détaillée et des tags, et retrouver ensuite cette image via une recherche par mots-clés.

---

## 📐 Architecture générale

```text
 ┌────────────┐        ┌───────────┐        ┌───────────────┐
 │  Utilisateur│─(1)──▶│   API     │─(2)──▶│ PostgreSQL    │
 └────────────┘        │ (FastAPI) │        │ (images & meta)│
                       │           │        └───────────────┘
                       │           │
                       │           │
                       │           │                ┌────────────────┐
                       │           │─(3)──▶     │ Microservice IA│
                       └───────────┘             │  (FastAPI)     │
                                                   └────────────────┘

Keycloak (auth) ◀─────┘
```

1. **Authentification** : l’utilisateur obtient un token JWT via Keycloak.
2. **API FastAPI** : vérifie le token, gère la base de données, valide le hash de l’image, et sert d’orchestrateur.
3. **Microservice IA** : traite l’image via Hugging Face (modèle Llama-4-Maverick-17B-128E-Instruct), renvoie description + tags.

---

## 🚀 Prérequis

* **Docker** & **Docker Compose** installés
* **Make** (facultatif, pour les commandes rapides)
* **Git** pour cloner le projet
* Un compte Hugging Face avec une **clé API** (scopes : appeler l’Inference API)

---

## ⚙️ Installation et lancement

1. **Cloner le dépôt**

   ```bash
   git clone https://github.com/Grand0x/image-ai-project.git
   cd image-ai-project
   ```

2. **Configurer les variables d’environnement**

   Créer un fichier `.env` à la racine :

   ```dotenv
   HUGGINGFACE_API_KEY=hf_votre_cle_api
   ```

3. **Démarrer les services**

   Grâce au `Makefile` :

   ```bash
   make up      # build + docker compose up
   ```

   Ou manuellement :

   ```bash
   docker compose up --build
   ```

4. **Vérifier l’état**

   ```bash
   docker compose ps
   ```

---

## 📖 Documentation de l’API

* **Swagger UI** : [http://localhost:8000/docs](http://localhost:8000/docs)
* **ReDoc** : [http://localhost:8000/redoc](http://localhost:8000/redoc)
* **OpenAPI JSON** : [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)

Vous pouvez y tester les routes suivantes :

| Route     | Méthode | Description                             |
| --------- | ------- | --------------------------------------- |
| `/upload` | POST    | Envoi d’une image (multipart/form-data) |
| `/search` | GET     | Recherche par mot-clé (`q`)             |
| `/me`     | GET     | Récupère l’utilisateur connecté (JWT)   |

*Pensez à cliquer sur **Authorize** dans Swagger et à entrer `Bearer <token>`. Vous obtenez le token via Keycloak.*

---

## 🔄 Flux de traitement

1. **Upload** :

   * l’API calcule le SHA256 de l’image
   * si existant en base → renvoie directement la donnée
   * sinon → sauvegarde temporaire et envoi au microservice IA
2. **Microservice IA** :

   * reçoit l’image
   * génère une description via le modèle LLM
   * extrait des tags
   * renvoie `{ "description": ..., "tags": [...] }`
3. **API** :

   * stocke la description et les tags en base
   * retourne ces métadonnées à l’utilisateur
4. **Recherche** :

   * l’utilisateur saisit un mot-clé
   * l’API filtre sur `description` et `tags` (SQL `ILIKE`)
   * renvoie la liste des images correspondantes

---

## 💡 Justification des choix technologiques

| Composant        | Technologie                 | Pourquoi ?                                    |
| ---------------- | --------------------------- | --------------------------------------------- |
| Authentification | Keycloak                    | Solution open-source, support OAuth2/JWT      |
| API              | FastAPI                     | Rapide, asynchrone, auto-doc, facile à tester |
| Orm & BDD        | SQLAlchemy + PostgreSQL     | API Python mature + base fiable SQL           |
| Microservice IA  | Transformers (Hugging Face) | Accès aux LLMs les plus récents               |
| Conteneurisation | Docker + Compose            | Portabilité, isolation, déploiement rapide    |
| Gestion CI/CD    | Makefile                    | Raccourcis simples, intégration pipeline      |

---

## 🧹 Nettoyage

```bash
make down   # stop
make clean  # stop + prune volumes/images
```

---

*Pour toute question ou retour, n’hésitez pas à ouvrir une issue ou à me contacter directement.*
