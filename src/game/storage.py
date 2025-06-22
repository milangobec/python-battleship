import json
import os
import uuid
from ship import Ship
from board import Board
from player import Player

player_ids_file = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    'data',
    'player_data.json'
)

player = Player
ship = Ship
board = Board

class PlayerDataManager:
    def __init__(self, file_path=player_ids_file):
        self.file_path = file_path
        self.data = self._load_data()
    
    def _load_data(self):
        if os.path.exists(self.file_path):
            with open(self.file_path, 'r') as file:
                try:
                    return json.load(file)
                except json.JSONDecodeError:
                    return {}
        else:
            return {}
    
    def save(self):
        with open(self.file_path, 'w') as file:
            json.dump(self.data, file, indent=4)
    
    def save_player(self,player):
        self.data[player.id] = player.to_dict_profile()
        self.save()

    def get_player_profile(self, player_id) -> Player | None:
        raw = self.data.get(player_id)
        if raw:
            return Player.from_dict_profile(raw)
        return None
    
    def remove_player(self, player_id):
        if player_id in self.data:
            del self.data[player_id]
            self.save()

    def player_exists(self, player_id) -> bool:
        return player_id in self.data

game_states_file = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    'data',
    'saved_games.json'
)

class GameStorage:
    def __init__(self, game_id = None, file_path=game_states_file):
        self.file_path = file_path
        self.data = self._load_data()
        self.id = game_id

    def _load_data(self):
        if os.path.exists(self.file_path):
            with open(self.file_path, 'r') as file:
                try:
                    return json.load(file)
                except json.JSONDecodeError:
                    return {}
        else:
            return {}
    
    def save(self):
        with open(self.file_path, 'w') as file:
            json.dump(self.data, file, indent=4)

    def save_game(self, game, player1, player2, board1, board2):
        game_id = self.generate_game_id(player1.id, player2.id)
        self.data[game_id] = {
            "player1": player1.to_dict_profile(),
            "board1": board1.to_dict_save(),
            "player1ships": [ship.to_dict_save() for ship in player1.ships],
            "player2": player2.to_dict_profile(),
            "board2": board2.to_dict_save(),
            "player2ships": [ship.to_dict_save() for ship in player2.ships],
            "turn_count": game.turn_count,
            "current_turn": game.current_turn.id,
            "game_over": game.game_over
        }
        self.save()
        self.id = game_id
        return game_id
    
    def load_game(self, game_id):
        from game import Game
        raw = self.data.get(game_id)
        if raw:
            player1 = Player.from_dict_profile(raw['player1'])
            player2 = Player.from_dict_profile(raw['player2'])
            board1 = Board.from_dict_save(raw['board1'])
            board2 = Board.from_dict_save(raw['board2'])
            player1.ships = [Ship.from_dict_save(ship) for ship in raw['player1ships']]
            player2.ships = [Ship.from_dict_save(ship) for ship in raw['player2ships']]
            player1.board = board1
            player2.board = board2
            
            game = Game.from_dict({
                "current_turn": raw['current_turn'],
                "turn_count": raw['turn_count'],
                "game_over": raw['game_over']
            }, player1, player2)

            return game, player1, player2, board1, board2
        return None, None, None, None
    
    def generate_game_id(self, player1id, player2id) -> str:
        id = str(uuid.uuid4())
        return id + f"_{player1id}_{player2id}"
    
    def game_exists(self, game_id) -> bool:
        return game_id in self.data
