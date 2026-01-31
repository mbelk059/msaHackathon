"""
Minimal API that serves actionable crises JSON for the CrisisAI frontend.
Run from project root: uv run python -m src.crisis_api
Serves GET /api/crises on port 8001. Frontend proxies /api to this when backend is running.
"""
from pathlib import Path
import json

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="CrisisAI API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "crises"
CRISES_FILE = DATA_DIR / "mock_actionable_crises.json"


@app.get("/api/crises")
def get_crises():
    if not CRISES_FILE.exists():
        return {"status": "error", "message": "Crisis data not found", "crises": []}
    with open(CRISES_FILE, encoding="utf-8") as f:
        data = json.load(f)
    crises = data.get("crises", [])
    crises.sort(key=lambda c: c.get("severity_score", 0), reverse=True)
    return {"status": "success", "count": len(crises), "crises": crises}


def main():
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)


if __name__ == "__main__":
    main()
