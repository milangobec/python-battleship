from fastapi import APIRouter, HTTPException
from api.models import PlayerCreate, PlayerResponse
from api.services import PlayerService

router = APIRouter()

@router.get("/{player_id}", response_model=PlayerResponse)
def get_player(player_id: str):
    """Get a player by ID"""
    try:
        player = PlayerService.load_player(player_id)
        if not player:
            raise HTTPException(status_code=404, detail="Player not found")
        return player.to_dict_profile()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Player data not found")

@router.post("/create")
def create_player(player_data: PlayerCreate):
    """Create a new player"""
    try:
        player = PlayerService.create_player(player_data.name)
        return {
            "player_id": player.id,
            "name": player.name,
            "message": "Player created successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
