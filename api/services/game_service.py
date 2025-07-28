from src.game.core import Game, Board, Ship, GameStorage, PlayerDataManager
from api.models import GameBoardsResponse, AttackResponse, ShipPlacementResponse
from .player_service import PlayerService
import uuid

class GameService:
    def __init__(self):
        self.game_storage = GameStorage()
        self.player_manager = PlayerDataManager()

    def get_game(self, game_id: str):
        """Get a game by ID"""
        result = self.game_storage.load_game(game_id)
        if result[0] is None:
            return None
        game, player1, player2, board1, board2 = result
        winner_id = None
        if game.game_over:
            # The winner is the player who did NOT just have their ships sunk
            if board1.all_ships_sunk():
                winner_id = player2.id
            elif board2.all_ships_sunk():
                winner_id = player1.id
        return game, player1, player2, board1, board2, winner_id

    def get_game_by_player(self, player_id: str):
        """Get a game by player ID (player1 or player2)"""
        # Ensure data is up to date
        self.game_storage.data = self.game_storage.load_all_games()
        for game_id, game_data in self.game_storage.data.items():
            p1 = game_data.get('player1', {}).get('id')
            p2 = game_data.get('player2', {}).get('id')
            if player_id in [p1, p2]:
                return self.get_game(game_id)
        return None

    def create_game(self, player1_id: str, player2_id: str) -> str:
        """Create a new game between two players"""
        player1 = PlayerService.load_player(player1_id)
        player2 = PlayerService.load_player(player2_id)
        
        if not player1 or not player2:
            raise ValueError("One or both players not found")
        
        # Create empty boards for manual ship placement
        player1.board = Board()
        player2.board = Board()
        player1.ships = []
        player2.ships = []
        
        # Create game
        game = Game(player1, player2, storage=self.game_storage)
        game_id = str(uuid.uuid4())
        game.game_id = game_id
        game_id = self.game_storage.save_game(game, player1, player2, player1.board, player2.board)
        
        return game_id

    def make_attack(self, game_id: str, player_id: str, x: int, y: int) -> AttackResponse:
        """Process an attack in a game"""
        result = self.game_storage.load_game(game_id)
        if result[0] is None:
            raise ValueError("Game not found")
        
        game, player1, player2, board1, board2 = result
        
        # Verify it's the player's turn
        if game.current_turn.id != player_id:
            raise ValueError("Not your turn")
        
        # Determine which board to attack
        if game.current_turn.id == player1.id:
            target_board = board2
        else:
            target_board = board1
            
        attack_result = target_board.recieve_attack(x, y)
        
        # Update game state
        winner_id = None
        if attack_result == 'x':
            game.current_turn.record_hit()
            if target_board.all_ships_sunk():
                game.game_over = True
                game.current_turn.record_win()
                game.opponent.record_loss()
                winner_id = game.current_turn.id
        else:
            game.current_turn.record_miss()
        
        # Save player stats after every attack
        self.player_manager.save_player(player1)
        self.player_manager.save_player(player2)
        
        if not game.game_over:
            game.switch_turn()
            game.turn_count += 1
        
        # Save updated game state
        self.game_storage.save_game(game, player1, player2, board1, board2, game_id)
        
        return AttackResponse(
            result=attack_result,
            game_over=game.game_over,
            current_turn=game.current_turn.id,
            winner=game.current_turn.name if game.game_over else None,
            winner_id=winner_id
        )

    def place_ship(self, game_id: str, player_id: str, ship_name: str, x: int, y: int, orientation: str) -> ShipPlacementResponse:
        """Place a ship on a player's board"""
        result = self.game_storage.load_game(game_id)
        if result[0] is None:
            raise ValueError("Game not found")
        
        game, player1, player2, board1, board2 = result
        
        # Determine which player is placing the ship
        if player_id == player1.id:
            player = player1
            board = board1
        elif player_id == player2.id:
            player = player2
            board = board2
        else:
            raise ValueError("Player not found in this game")
        
        # Check if ship is already placed
        ship_names = [ship.name for ship in player.ships]
        if ship_name in ship_names:
            raise ValueError(f"Ship {ship_name} already placed")
        
        # Available ships and their sizes
        available_ships = {
            "carrier": 5,
            "battleship": 4,
            "cruiser": 3,
            "submarine": 3,
            "destroyer": 2
        }
        
        if ship_name not in available_ships:
            raise ValueError(f"Invalid ship name: {ship_name}")
        
        # Create and place the ship
        ship = Ship(
            ship_name, 
            available_ships[ship_name],
            x,
            y,
            orientation
        )
        board.place_ship(ship, x, y, orientation)
        player.ships.append(ship)

        # Check if all ships are placed for this player
        if len(player.ships) == len(available_ships):
            if player_id == player1.id:
                game.player1_ready = True
            else:
                game.player2_ready = True

        # If both players are ready, randomly set current_turn (if not already set)
        if game.all_ships_placed():
            # Only randomize current_turn once, when both are ready
            import random
            if not hasattr(game, '_turn_randomized') or not getattr(game, '_turn_randomized'):
                if random.randint(0, 1) == 0:
                    game.current_turn = player1
                    game.opponent = player2
                else:
                    game.current_turn = player2
                    game.opponent = player1
                game._turn_randomized = True
        
        # Save the updated game state
        self.game_storage.save_game(game, player1, player2, board1, board2, game_id)

        return ShipPlacementResponse(
            success=True,
            message=f"Ship {ship_name} placed successfully",
            placed_ships=[ship.name for ship in player.ships]
        )
