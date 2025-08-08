# Battleship Game

A full-stack Battleship game with a Python FastAPI backend and a React frontend.

---

## Project Structure

```
battleship/
  ├── data/                # Game, player, and lobby data (auto-created)
  ├── frontend/            # React frontend app
  ├── src/
  │   └── game/            # Python backend (FastAPI)
  │       └── core/        # Game logic modules
  ├── tests/               # Python tests
  ├── README.md            
  └── pyproject.toml       # Python dependencies
```

---

## Prerequisites

- **Python 3.9+** (recommend using [pyenv](https://github.com/pyenv/pyenv) or [Anaconda](https://www.anaconda.com/))
- **Node.js 16+** and **npm** (for the frontend)

---

## Backend Setup (Python FastAPI)

1. **Clone the repository:**
   ```sh
   git clone https://github.com/milangobec/python-battleship
   cd battleship
   ```
2. **Create a virtual environment:**
   ```sh
   python3 -m venv venv
   source venv/bin/activate
   ```
3. **Install dependencies:**
   ```sh
   pip install -r requirements.txt
   ```
4. **Check package structure:**
   - Ensure `src/__init__.py` and `src/game/__init__.py` exist (should be present).
   - All imports in `src/game/main.py` are relative (e.g., `from .core import ...`).
5. **Run the backend server:**
   ```sh
   uvicorn src.game.main:app --reload
   ```
   - The API will be available at `http://localhost:8000/`
   - OpenAPI docs: `http://localhost:8000/docs`

---

## Frontend Setup (React)

1. **Navigate to the frontend directory:**
   ```sh
   cd frontend
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Start the React app:**
   ```sh
   npm start
   ```
   - The app will run at `http://localhost:3000/`
   - The frontend proxies API requests to the backend.

---

## Running the Full Stack

- **Start the backend** (`uvicorn ...`) and **frontend** (`npm start`) in separate terminals.
- Register a player, create/join a lobby, and play!

---

## Troubleshooting

- **ModuleNotFoundError: No module named 'src'**
  - Make sure you run the backend with `uvicorn src.game.main:app` and not `python src/game/main.py`.
  - Ensure all `__init__.py` files exist in `src/` and `src/game/`.
- **CORS errors**
  - The backend allows requests from `localhost:3000` by default. If you change ports, update CORS settings in `main.py`.
- **Port conflicts**
  - Make sure nothing else is running on ports 8000 (backend) or 3000 (frontend).
- **Frontend can't connect to backend**
  - Ensure both servers are running. Check browser console and backend logs for errors.