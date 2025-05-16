up:
	docker compose up --build

down:
	docker compose down

api:
	cd api && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

ml:
	cd ml_service && uvicorn app.worker:app --reload --host 0.0.0.0 --port 5000

test:
	python api/tests/test_endpoints.py

logs:
	docker compose logs -f --tail=100

clean:
	docker compose down -v && docker system prune -f

build-api:
	docker compose build api

up-api:
	docker compose up --no-deps --build api

build-ml:
	docker compose build ml_service

up-ml:
	docker compose up --no-deps --build ml_service