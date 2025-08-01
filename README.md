# Battleship Game

A full-stack Battleship game with a Python FastAPI backend and a React frontend built with Vite.

---

## Project Structure

```
battleship/
  ├── api/                 # FastAPI application layer
  │   ├── models.py        # Pydantic models for API
  │   ├── routers/         # API route handlers
  │   │   ├── games.py     # Game-related endpoints
  │   │   ├── lobbies.py   # Lobby management
  │   │   └── players.py   # Player management
  │   └── services/        # Business logic services
  │       ├── game_service.py
  │       ├── lobby_service.py
  │       └── player_service.py
  ├── data/                # Game, player, and lobby data (auto-created)
  ├── docs/                # Documentation
  ├── frontend/            # React frontend app (Vite)
  │   ├── src/             # React source code
  │   ├── public/          # Static assets
  │   ├── package.json     # Frontend dependencies
  │   └── vite.config.js   # Vite configuration
  ├── src/
  │   └── game/            # Core game logic
  │       ├── core/        # Game engine modules
  │       │   ├── board.py # Game board logic
  │       │   ├── game.py  # Main game state
  │       │   ├── player.py # Player management
  │       │   ├── ship.py  # Ship placement logic
  │       │   └── storage.py # Data persistence
  │       └── cli.py       # Command-line interface
  ├── tests/               # Python tests
  ├── main.py              # FastAPI application entry point
  ├── pyproject.toml       # Python dependencies
  ├── uv.lock              # Dependency lock file
  └── README.md
```

---

## Prerequisites

- **Python 3.13+** (recommend using [pyenv](https://github.com/pyenv/pyenv) or [Anaconda](https://www.anaconda.com/))
- **Node.js 18+** and **npm** (for the frontend)
- **uv** (recommended Python package manager) - install with `pip install uv`

---

## Backend Setup (Python FastAPI)

1. **Clone the repository:**
   ```sh
   git clone https://github.com/milangobec/python-battleship
   cd battleship
   ```

2. **Install dependencies (using uv - recommended):**
   ```sh
   uv sync
   ```
   
   **Or using pip:**
   ```sh
   pip install -e .
   ```

3. **Run the backend server:**
   ```sh
   uvicorn main:app --reload
   ```
   - The API will be available at `http://localhost:8000/`
   - OpenAPI docs: `http://localhost:8000/docs`

---

## Frontend Setup (React + Vite)

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
   npm run dev
   ```
   - The app will run at `http://localhost:5173/` (Vite default port)
   - The frontend proxies API requests to the backend.

---

## Running the Full Stack

- **Start the backend** (`uvicorn main:app --reload`) and **frontend** (`npm run dev`) in separate terminals.
- Register a player, create/join a lobby, and play!

## Key Dependencies

### Backend (Python)
- **FastAPI** - Web framework for building APIs
- **Pydantic** - Data validation using Python type annotations
- **uvicorn** - ASGI server for running FastAPI

### Frontend (React)
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework

---

## Troubleshooting

- **ModuleNotFoundError: No module named 'src'**
  - Make sure you run the backend with `uvicorn main:app` and not `python main.py`.
  - Ensure all `__init__.py` files exist in the required directories.
- **CORS errors**
  - The backend allows requests from `localhost:5173` by default (Vite's default port). If you change ports, update CORS settings in `main.py`.
- **Port conflicts**
  - Make sure nothing else is running on ports 8000 (backend) or 5173 (frontend).
- **Frontend can't connect to backend**
  - Ensure both servers are running. Check browser console and backend logs for errors.
- **uv not found**
  - Install uv with `pip install uv` or use pip directly with `pip install -e .`