import json
import os
import uuid
from .ship import Ship
from .board import Board
from .player import Player
from pathlib import Path


PROJECT_ROOT = Path(__file__).parent.parent.parent.parent
DATA_DIR = PROJECT_ROOT / 'data'
DATA_DIR.mkdir(parents=True, exist_ok=True)

player_ids_file = DATA_DIR / 'player_data.json'
game_states_file = DATA_DIR / 'saved_games.json'
lobby_file = DATA_DIR / 'lobbies.json'

player = Player
ship = Ship
board = Board

class PlayerDataManager:
    def __init__(self, file_path=None):
        if file_path is None:
            self.file_path = str(player_ids_file)
        else:
            self.file_path = file_path
        self.ensure_file_exists()
    
    def ensure_file_exists(self):
        os.makedirs(os.path.dirname(self.file_path), exist_ok=True)
        if not os.path.exists(self.file_path):
            with open(self.file_path, 'w') as f:
                json.dump({}, f)
    
    def save_player(self, player):
        data = self.load_all_players()
        data[player.id] = player.to_dict_profile()
        self.save_all_players(data)
    
    def load_all_players(self):
        try:
            with open(self.file_path, 'r') as f:
                content = f.read().strip()
                if not content:
                    return {}
                return json.loads(content)
        except (json.JSONDecodeError, FileNotFoundError):
            return {}
    
    def save_all_players(self, data):
        with open(self.file_path, 'w') as f:
            json.dump(data, f, indent=4)
    
    def get_player_profile(self, player_id):
        data = self.load_all_players()
        if player_id in data:
            return Player.from_dict_profile(data[player_id])
        return None
    
    def player_exists(self, player_id):
        data = self.load_all_players()
        return player_id in data

class GameStorage:
    def __init__(self, file_path=None):
        if file_path is None:
            self.file_path = str(game_states_file)
        else:
            self.file_path = file_path
        self.ensure_file_exists()
        self.data = self.load_all_games()
    
    def ensure_file_exists(self):
        os.makedirs(os.path.dirname(self.file_path), exist_ok=True)
        if not os.path.exists(self.file_path):
            with open(self.file_path, 'w') as f:
                json.dump({}, f)
    
    def save_game(self, game, player1, player2, board1, board2, game_id=None):
        if game_id is None:
            game_id = game.game_id if hasattr(game, 'game_id') else str(uuid.uuid4())
        
        game_data = {
            "game": game.to_dict(),
            "player1": player1.to_dict_profile(),
            "player2": player2.to_dict_profile(),
            "board1": board1.to_dict_save(),
            "board2": board2.to_dict_save()
        }
        
        print(f"[DEBUG] GameStorage.save_game - game.to_dict(): {game.to_dict()}")
        print(f"[DEBUG] GameStorage.save_game - current_turn in game_data: {game_data['game']['current_turn']}")
        
        self.data[game_id] = game_data
        self.save_all_games()
        return game_id
    
    def load_game(self, game_id):
        self.data = self.load_all_games()
        if game_id not in self.data:
            return None, None, None, None, None
        
        game_data = self.data[game_id]
        
        # Reconstruct players
        player1 = Player.from_dict_profile(game_data["player1"])
        player2 = Player.from_dict_profile(game_data["player2"])
        
        # Reconstruct boards
        board1 = Board.from_dict_save(game_data["board1"])
        board2 = Board.from_dict_save(game_data["board2"])
        
        # Sync players' ships lists with the ships on their boards
        player1.ships = board1.ships.copy()
        player2.ships = board2.ships.copy()
        
        # Import Game here to avoid circular import
        from .game import Game
        game = Game.from_dict(game_data["game"], player1, player2, self)
        
        return game, player1, player2, board1, board2
    
    def load_all_games(self):
        try:
            with open(self.file_path, 'r') as f:
                content = f.read().strip()
                if not content:
                    return {}
                return json.loads(content)
        except (json.JSONDecodeError, FileNotFoundError):
            return {}
    
    def save_all_games(self):
        with open(self.file_path, 'w') as f:
            json.dump(self.data, f, indent=4)

class LobbyStorage:
    def __init__(self, file_path=None):
        if file_path is None:
            self.file_path = str(lobby_file)
        else:
            self.file_path = file_path
        self.ensure_file_exists()
        self.data = self.load_all_lobbies()
    
    def ensure_file_exists(self):
        os.makedirs(os.path.dirname(self.file_path), exist_ok=True)
        if not os.path.exists(self.file_path):
            with open(self.file_path, 'w') as f:
                json.dump({}, f)
    
    def create_lobby(self, lobby_id, host_id, host_name, lobby_name=None):
        lobby_data = {
            "id": lobby_id,
            "name": lobby_name or f"{host_name}'s Lobby",
            "host_id": host_id,
            "host_name": host_name,
            "players": [host_id],
            "created_at": str(uuid.uuid4())
        }
        
        self.data[lobby_id] = lobby_data
        self.save_all_lobbies()
        return lobby_data
    
    def get_lobby(self, lobby_id):
        return self.data.get(lobby_id)
    
    def add_player_to_lobby(self, lobby_id, player_id):
        if lobby_id not in self.data:
            return None
        
        lobby = self.data[lobby_id]
        if player_id not in lobby["players"]:
            lobby["players"].append(player_id)
            self.save_all_lobbies()
        
        return lobby
    
    def remove_lobby(self, lobby_id):
        if lobby_id in self.data:
            del self.data[lobby_id]
            self.save_all_lobbies()
    
    def get_available_lobbies(self):
        # Reload data from file to ensure we have the latest state
        self.data = self.load_all_lobbies()
        available = []
        for lobby_id, lobby in self.data.items():
            if len(lobby["players"]) < 2:
                available.append({
                    "id": lobby_id,
                    "name": lobby["name"],
                    "host_name": lobby["host_name"],
                    "player_count": len(lobby["players"])
                })
        return available
    
    def load_all_lobbies(self):
        try:
            with open(self.file_path, 'r') as f:
                content = f.read().strip()
                if not content:
                    return {}
                return json.loads(content)
        except (json.JSONDecodeError, FileNotFoundError):
            return {}
    
    def save_all_lobbies(self):
        with open(self.file_path, 'w') as f:
            json.dump(self.data, f, indent=4)