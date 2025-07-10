from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from .models import PlayerCreate, GameCreate, AttackRequest, LobbyCreate, LobbyJoin, ShipPlacement
from .core import Player, Board, Ship, Game, PlayerDataManager, GameStorage, LobbyStorage
import os,json, uuid
from datetime import datetime


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Create data directory if it doesn't exist (relative to battleship root)
DATA_DIR = "data"
os.makedirs(DATA_DIR, exist_ok=True)

PLAYER_DATA_FILE = os.path.join(DATA_DIR, "player_data.json")

if not os.path.exists(PLAYER_DATA_FILE):
    with open(PLAYER_DATA_FILE, "w") as f:
        json.dump({}, f)

# Initialize storage managers
player_manager = PlayerDataManager()
game_storage = GameStorage()
lobby_storage = LobbyStorage()

def load_all_players() -> dict:
    with open(PLAYER_DATA_FILE, "r") as f:
        return json.load(f)
    
def save_all_players(data:dict):
    with open(PLAYER_DATA_FILE, "w") as f:
        json.dump(data, f, indent=4)

def save_player(player:Player):
    data = load_all_players()
    data[player.id] = player.to_dict_profile()
    save_all_players(data)

def load_player(player_id: str) -> Player | None:
    data = load_all_players()
    if player_id in data:
        return Player.from_dict_profile(data[player_id])
    return None

@app.get("/")
def read_index():
    return FileResponse('src/game/static/index.html')

@app.get("/players/{player_id}")
def get_player(player_id: str):
    player = load_player(player_id)
    try:
        with open(PLAYER_DATA_FILE, "r") as f:
            players = json.load(f)
        if player_id in players:
            return player.to_dict_profile()
        else:
            raise HTTPException(status_code=404, detail="Player not found")
    except:
        raise HTTPException(status_code=500, detail="Player data not found")

@app.post("/players/create")
def create_player(player_data: PlayerCreate):
    player_id = Player.generate_player_id()
    player = Player(name=player_data.name, id=player_id)
    save_player(player)
    return {
        "player_id": player.id,
        "name": player.name,
        "message": "Player created successfully"
    }

@app.post("/lobby/create")
def create_lobby(lobby_data: LobbyCreate):
    player = load_player(lobby_data.player_id)
    if not player:
        raise HTTPException(status_code=404, detail="player not found...")
    
    lobby_id = str(uuid.uuid4())
    lobby_name = lobby_data.lobby_name if lobby_data.lobby_name is not None else ""
    lobby = lobby_storage.create_lobby(lobby_id, lobby_data.player_id, player.name, lobby_name)
    
    return {
        "lobby_id": lobby_id,
        "lobby_name": lobby["name"] if lobby["name"] is not None else "",
        "host_name": player.name,
        "player_count": len(lobby.get("players", [])),
        "created_at": datetime.utcnow().isoformat()
    }

@app.get("/lobby/list")
def list_lobbies():
    lobbies = lobby_storage.get_available_lobbies() 
    return {"lobbies": lobbies}

@app.post("/lobby/{lobby_id}/join")
def join_lobby(lobby_id: str, join_data: LobbyJoin):
    lobby = lobby_storage.get_lobby(lobby_id)
    if not lobby:
        for game_id, game_data in game_storage.data.items():
            p1 = game_data.get('player1', {}).get('id')
            p2 = game_data.get('player2', {}).get('id')
            if join_data.player_id in [p1,p2]:
                return {
                    "game_created": True,
                    "game_id": game_id,
                    "player1": game_data["player1"],
                    "player2": game_data["player2"],
                    "current_turn": game_data['game'].get('current_turn'),
                    "boards": {
                        "player1_board": game_data['board1'],
                        "player2_board": game_data['board2']
                    }
                }
        raise HTTPException(status_code=404, detail="Lobby not found")
    
    if len(lobby["players"]) >= 2:
        raise HTTPException(status_code=400, detail="Lobby is full")
    
    if join_data.player_id in lobby["players"]:
        raise HTTPException(status_code=400, detail="Already in lobby")
    
    player = load_player(join_data.player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    # Add player to lobby
    updated_lobby = lobby_storage.add_player_to_lobby(lobby_id, join_data.player_id)
    
    # If lobby is now full, create the game
    if len(updated_lobby["players"]) == 2:
        player1 = load_player(updated_lobby["players"][0])
        player2 = load_player(updated_lobby["players"][1])
        
        # Create empty boards for manual ship placement
        player1.board = Board()
        player2.board = Board()
        player1.ships = []
        player2.ships = []
        
        # Create game
        game = Game(player1, player2, storage=game_storage)
        game_id = game_storage.save_game(game, player1, player2, player1.board, player2.board)
        game.game_id = game_id
        
        # Remove lobby
        lobby_storage.remove_lobby(lobby_id)
        
        return {
            "game_created": True,
            "game_id": game_id,
            "player1": player1.to_dict_profile(),
            "player2": player2.to_dict_profile(),
            "current_turn": game.current_turn.id,
            "boards": {
                "player1_board": player1.board.to_dict(),
                "player2_board": player2.board.to_dict()
            }
        }
    
    return {
        "game_created": False,
        "message": f"Joined {lobby['name']}. Waiting for opponent..."
    }

@app.post("/games/create")
def create_game(game_data: GameCreate):
    player1 = load_player(game_data.player1_id)
    if not player1:
        player1 = Player(id=game_data.player1_id, name=game_data.player1_name)
        save_player(player1)
    player2 = load_player(game_data.player2_id)
    if not player2:
        player2 = Player(id=game_data.player2_id, name=game_data.player2_id)
    
    if not player1 or not player2:
        return {"error": "One or both players not found"}
    
    player1.board = Board()
    player2.board = Board()
    player1.ships = []
    player2.ships = []
    
    # Create game
    game = Game(player1, player2, storage=game_storage)
    game_id = game_storage.save_game(game, player1, player2, player1.board, player2.board)
    game.game_id = game_id
    
    return {
        "game_id": game_id,
        "player1": player1.to_dict_profile(),
        "player2": player2.to_dict_profile(),
        "current_turn": game.current_turn.id,
        "boards": {
            "player1_board": player1.board.to_dict(),
            "player2_board": player2.board.to_dict()
        }
    }

@app.get("/games/{game_id}")
def get_game(game_id: str):
    result = game_storage.load_game(game_id)
    if result[0] is None:
        return {"error": "Game not found"}
    
    game, player1, player2, board1, board2 = result
    
    return {
        "game_id": game_id,
        "player1": player1.to_dict_profile(),
        "player2": player2.to_dict_profile(),
        "current_turn": game.current_turn.id,
        "game_over": game.game_over,
        "turn_count": game.turn_count,
        "boards": {
            "player1_board": board1.to_dict(),
            "player2_board": board2.to_dict()
        }
    }

@app.post("/games/{game_id}/attack")
def make_attack(game_id: str, attack_data: AttackRequest):
    result = game_storage.load_game(game_id)
    if result[0] is None:
        return {"error": "Game not found"}
    
    game, player1, player2, board1, board2 = result
    
    # Verify it's the player's turn
    if game.current_turn.id != attack_data.player_id:
        return {"error": "Not your turn"}
    
    try:
        # Determine which board to attack
        target_board = board2 if game.current_turn.id == player1.id else board1
        result = target_board.recieve_attack(attack_data.x, attack_data.y)
        
        # Update game state
        if result == 'x':
            game.current_turn.record_hit()
            if target_board.all_ships_sunk():
                game.game_over = True
                game.current_turn.record_win()
                game.opponent.record_loss()
        else:
            game.current_turn.record_miss()
        
        if not game.game_over:
            game.switch_turn()
            game.turn_count += 1
        else:
            return {"message": "game Over!"}
        
        # Save updated game state
        game_storage.save_game(game, player1, player2, board1, board2, game_id)
        
        return {
            "result": result,
            "game_over": game.game_over,
            "current_turn": game.current_turn.id,
            "winner": game.current_turn.name if game.game_over else None
        }
        
    except ValueError as e:
        return {"error": str(e)}

@app.post("/games/{game_id}/place-ship")
def place_ship(game_id: str, placement_data: ShipPlacement):
    result = game_storage.load_game(game_id)
    if result[0] is None:
        return {"error": "Game not found"}
    
    game, player1, player2, board1, board2 = result
    
    # Determine which player is placing the ship
    if placement_data.player_id == player1.id:
        player = player1
        board = board1
    elif placement_data.player_id == player2.id:
        player = player2
        board = board2
    else:
        return {"error": "Player not found in this game"}
    
    # Check if ship is already placed
    ship_names = [ship.name for ship in player.ships]
    if placement_data.ship_name in ship_names:
        return {"error": f"Ship {placement_data.ship_name} already placed"}
    
    # Create and place the ship
    available_ships = {
        "carrier": 5,
        "battleship": 4,
        "cruiser": 3,
        "submarine": 3,
        "destroyer": 2
    }
    
    if placement_data.ship_name not in available_ships:
        return {"error": f"Invalid ship name: {placement_data.ship_name}"}
    
    try:
        ship = Ship(
            placement_data.ship_name, 
            available_ships[placement_data.ship_name],
            placement_data.x,
            placement_data.y,
            placement_data.orientation
        )
        board.place_ship(ship, placement_data.x, placement_data.y, placement_data.orientation)
        player.ships.append(ship)
        
        # Save the updated game state
        game_storage.save_game(game, player1, player2, board1, board2, game_id)
        
        return {
            "success": True,
            "message": f"Ship {placement_data.ship_name} placed successfully",
            "placed_ships": [ship.name for ship in player.ships]
        }
        
    except ValueError as e:
        return {"error": str(e)}
