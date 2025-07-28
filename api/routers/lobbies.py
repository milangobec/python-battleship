from fastapi import APIRouter, HTTPException
from api.models import LobbyCreate, LobbyJoin, LobbyJoinResponse, LobbyListResponse
from api.services import LobbyService

router = APIRouter()
lobby_service = LobbyService()

@router.post("/create")
def create_lobby(lobby_data: LobbyCreate):
    """Create a new lobby"""
    try:
        return lobby_service.create_lobby(lobby_data.player_id, lobby_data.lobby_name)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/list", response_model=LobbyListResponse)
def list_lobbies():
    """Get list of available lobbies"""
    try:
        lobbies = lobby_service.get_available_lobbies()
        return LobbyListResponse(lobbies=lobbies)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{lobby_id}/join", response_model=LobbyJoinResponse)
def join_lobby(lobby_id: str, join_data: LobbyJoin):
    """Join a lobby"""
    try:
        return lobby_service.join_lobby(lobby_id, join_data.player_id)
    except ValueError as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=str(e))
        else:
            raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
