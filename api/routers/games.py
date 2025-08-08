from fastapi import APIRouter, HTTPException
from api.models import (
    AttackRequest, ShipPlacement, GameResponse, 
    AttackResponse, ShipPlacementResponse, GameBoardsResponse
)
from api.services import GameService

router = APIRouter()
game_service = GameService()

@router.get("/{game_id}", response_model=GameResponse)
def get_game(game_id: str):
    """Get a game by ID"""
    result = game_service.get_game(game_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Game not found")
    
    game, player1, player2, board1, board2, winner_id = result
    
    # Use masked boards for API response
    return GameResponse(
        game_id=game_id,
        player1=player1.to_dict_profile(),
        player2=player2.to_dict_profile(),
        current_turn=game.current_turn.id,
        game_over=game.game_over,
        turn_count=game.turn_count,
        boards=GameBoardsResponse(
            player1_board={"width": board1.width, "height": board1.height, "grid": board1.get_masked_board_api()},
            player2_board={"width": board2.width, "height": board2.height, "grid": board2.get_masked_board_api()}
        ),
        winner_id=winner_id
    )

@router.get("/by-player/{player_id}", response_model=GameResponse)
def get_game_by_player(player_id: str):
    result = game_service.get_game_by_player(player_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Game not found for player")
    game, player1, player2, board1, board2, winner_id = result
    return GameResponse(
        game_id=game.game_id,
        player1=player1.to_dict_profile(),
        player2=player2.to_dict_profile(),
        current_turn=game.current_turn.id,
        game_over=game.game_over,
        turn_count=game.turn_count,
        boards=GameBoardsResponse(
            player1_board={"width": board1.width, "height": board1.height, "grid": board1.get_masked_board_api()},
            player2_board={"width": board2.width, "height": board2.height, "grid": board2.get_masked_board_api()}
        ),
        winner_id=winner_id
    )

@router.post("/{game_id}/attack", response_model=AttackResponse)
def make_attack(game_id: str, attack_data: AttackRequest):
    """Make an attack in a game"""
    try:
        return game_service.make_attack(
            game_id, 
            attack_data.player_id, 
            attack_data.x, 
            attack_data.y
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{game_id}/place-ship", response_model=ShipPlacementResponse)
def place_ship(game_id: str, placement_data: ShipPlacement):
    """Place a ship on a player's board"""
    try:
        return game_service.place_ship(
            game_id,
            placement_data.player_id,
            placement_data.ship_name,
            placement_data.x,
            placement_data.y,
            placement_data.orientation
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
