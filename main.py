from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routers import players, games, lobbies
import os

app = FastAPI(title="Battleship API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Create data directory if it doesn't exist
DATA_DIR = "data"
os.makedirs(DATA_DIR, exist_ok=True)

# Include routers
app.include_router(players.router, prefix="/players", tags=["players"])
app.include_router(games.router, prefix="/games", tags=["games"])
app.include_router(lobbies.router, prefix="/lobby", tags=["lobbies"])

@app.get("/")
def read_root():
    return {"message": "Battleship API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
