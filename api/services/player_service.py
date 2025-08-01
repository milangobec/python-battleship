import json
import os
from src.game.core import Player

PLAYER_DATA_FILE = os.path.join("data", "player_data.json")

class PlayerService:
    @staticmethod
    def ensure_player_data_file():
        #Ensure the player data file exists
        if not os.path.exists(PLAYER_DATA_FILE):
            with open(PLAYER_DATA_FILE, "w") as f:
                json.dump({}, f)

    @staticmethod
    def load_all_players() -> dict:
        #Load all players from the data file
        PlayerService.ensure_player_data_file()
        with open(PLAYER_DATA_FILE, "r") as f:
            return json.load(f)
    
    @staticmethod
    def save_all_players(data: dict):
        #Save all players to the data file
        with open(PLAYER_DATA_FILE, "w") as f:
            json.dump(data, f, indent=4)

    @staticmethod
    def save_player(player: Player):
        #Save a single player to the data file
        data = PlayerService.load_all_players()
        data[player.id] = player.to_dict_profile()
        PlayerService.save_all_players(data)

    @staticmethod
    def load_player(player_id: str) -> Player | None:
        #Load a single player from the data file
        data = PlayerService.load_all_players()
        if player_id in data:
            return Player.from_dict_profile(data[player_id])
        return None

    @staticmethod
    def create_player(name: str) -> Player:
        #Create a new player and save it
        player_id = Player.generate_player_id()
        player = Player(name=name, id=player_id)
        PlayerService.save_player(player)
        return player

    @staticmethod
    def player_exists(player_id: str) -> bool:
        #Check if a player exists"""
        data = PlayerService.load_all_players()
        return player_id in data
