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