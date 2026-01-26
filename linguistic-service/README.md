# Linguistic Service

FastAPI service for per-segment linguistic analysis used by the timeline builder.

## Endpoints

- `POST /analyze`
  - Body: JSON array of `{ "segment_index": number, "text": string }`
  - Returns: array of `{ "segment_index": number, "linguistic_features": {...} }`

## Local Run

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Docker

```bash
docker build -t linguistic-service .
docker run -p 8000:8000 linguistic-service
```

## Deployment Notes

- Set `LINGUISTIC_SERVICE_URL` in the backend to the deployed URL (e.g. `https://your-service.railway.app`).
- The service uses COAST, LingFeat, spaCy, and textstat. If optional dependencies fail to load, the service will return fallback metrics and log a warning.
