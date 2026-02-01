"""
Minimal API that serves actionable crises JSON for the CrisisAI frontend.
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

# --- Bulletproof path resolution ---
# When run as `uv run python -m src.crisis_api` from project root,
# __file__ can resolve differently than expected.
# We search multiple candidate locations and use the first one that exists.

def find_crises_file() -> Path | None:
    """Search known locations for mock_actionable_crises.json"""
    candidates = [
        # 1) Relative to this file: src/ -> project_root/ -> data/crises/
        Path(__file__).resolve().parent.parent / "data" / "crises" / "mock_actionable_crises.json",
        # 2) Frontend public copy (in case backend data/ folder was never created)
        Path(__file__).resolve().parent.parent / "frontend" / "public" / "data" / "crises" / "mock_actionable_crises.json",
        # 3) Relative to CWD (where you actually ran the command from)
        Path.cwd() / "data" / "crises" / "mock_actionable_crises.json",
        # 4) CWD -> frontend/public (fallback)
        Path.cwd() / "frontend" / "public" / "data" / "crises" / "mock_actionable_crises.json",
    ]

    for path in candidates:
        if path.exists():
            return path

    # Nothing found so return the first candidate so the error message is useful
    return candidates[0]


CRISES_FILE = find_crises_file()


@app.get("/api/crises")
def get_crises():
    if not CRISES_FILE or not CRISES_FILE.exists():
        return {"status": "error", "message": f"Crisis data not found. Searched: {CRISES_FILE}", "crises": []}
    with open(CRISES_FILE, encoding="utf-8") as f:
        data = json.load(f)
    crises = data.get("crises", [])
    crises.sort(key=lambda c: c.get("severity_score", 0), reverse=True)
    return {"status": "success", "count": len(crises), "crises": crises}


# Debug endpoint
@app.get("/api/debug")
def debug_paths():
    candidates = [
        Path(__file__).resolve().parent.parent / "data" / "crises" / "mock_actionable_crises.json",
        Path(__file__).resolve().parent.parent / "frontend" / "public" / "data" / "crises" / "mock_actionable_crises.json",
        Path.cwd() / "data" / "crises" / "mock_actionable_crises.json",
        Path.cwd() / "frontend" / "public" / "data" / "crises" / "mock_actionable_crises.json",
    ]
    return {
        "__file__": str(Path(__file__).resolve()),
        "cwd": str(Path.cwd()),
        "resolved_to": str(CRISES_FILE),
        "resolved_exists": CRISES_FILE.exists() if CRISES_FILE else False,
        "all_candidates": [
            {"path": str(p), "exists": p.exists()} for p in candidates
        ],
    }


def main():
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)


if __name__ == "__main__":
    main()