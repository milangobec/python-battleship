from src.game.core import LobbyStorage, GameStorage
from api.models import LobbyJoinResponse, GameBoardsResponse
from .player_service import PlayerService
from .game_service import GameService
import uuid
from datetime import datetime

class LobbyService:
    def __init__(self):
        self.lobby_storage = LobbyStorage()
        self.game_storage = GameStorage()
        self.game_service = GameService()

    def create_lobby(self, player_id: str, lobby_name: str = None):
        """Create a new lobby"""
        player = PlayerService.load_player(player_id)
        if not player:
            raise ValueError("Player not found")
        
        lobby_id = str(uuid.uuid4())
        lobby_name = lobby_name if lobby_name is not None else ""
        lobby = self.lobby_storage.create_lobby(lobby_id, player_id, player.name, lobby_name)
        
        return {
            "lobby_id": lobby_id,
            "lobby_name": lobby["name"] if lobby["name"] is not None else "",
            "host_name": player.name,
            "player_count": len(lobby.get("players", [])),
            "created_at": datetime.utcnow().isoformat()
        }

    def get_available_lobbies(self):
        """Get list of available lobbies"""
        return self.lobby_storage.get_available_lobbies()

    def join_lobby(self, lobby_id: str, player_id: str) -> LobbyJoinResponse:
        """Join a lobby and potentially create a game"""
        lobby = self.lobby_storage.get_lobby(lobby_id)
        
        # Check if player is already in an active game
        if not lobby:
            for game_id, game_data in self.game_storage.data.items():
                p1 = game_data.get('player1', {}).get('id')
                p2 = game_data.get('player2', {}).get('id')
                if player_id in [p1, p2]:
                    boards = GameBoardsResponse(
                        player1_board=game_data['board1'],
                        player2_board=game_data['board2']
                    )
                    return LobbyJoinResponse(
                        game_created=True,
                        game_id=game_id,
                        player1=game_data["player1"],
                        player2=game_data["player2"],
                        current_turn=game_data['game'].get('current_turn'),
                        boards=boards
                    )
            raise ValueError("Lobby not found")
        
        if len(lobby["players"]) >= 2:
            raise ValueError("Lobby is full")
        
        if player_id in lobby["players"]:
            raise ValueError("Already in lobby")
        
        player = PlayerService.load_player(player_id)
        if not player:
            raise ValueError("Player not found")
        
        # Add player to lobby
        updated_lobby = self.lobby_storage.add_player_to_lobby(lobby_id, player_id)
        
        # If lobby is now full, create the game
        if len(updated_lobby["players"]) == 2:
            host_id = lobby["host_id"] if "host_id" in lobby else updated_lobby["players"][0]
            player1 = PlayerService.load_player(host_id)
            player2_id = [pid for pid in updated_lobby["players"] if pid != host_id][0]
            player2 = PlayerService.load_player(player2_id)
            
            # Create game using the game service
            game_id = self.game_service.create_game(player1.id, player2.id)
            
            # Get the created game data
            result = self.game_service.get_game(game_id)
            game, player1, player2, board1, board2, winner_id = result
            
            # Remove lobby
            self.lobby_storage.remove_lobby(lobby_id)
            
            boards = GameBoardsResponse(
                player1_board=board1.to_dict(),
                player2_board=board2.to_dict()
            )
            return LobbyJoinResponse(
                game_created=True,
                game_id=game_id,
                player1=player1.to_dict_profile(),
                player2=player2.to_dict_profile(),
                current_turn=game.current_turn.id,
                boards=boards
            )
        
        return LobbyJoinResponse(
            game_created=False,
            message=f"Joined {lobby['name']}. Waiting for opponent..."
        )
