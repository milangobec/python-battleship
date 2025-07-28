from pydantic import BaseModel
from typing import Optional, List, Dict, Any

#models
class PlayerCreate(BaseModel):
    name: str

class GameCreate(BaseModel):
    player1_id: str
    player2_id: str

class AttackRequest(BaseModel):
    x: int
    y: int
    player_id: str

class LobbyJoin(BaseModel):
    player_id: str

class LobbyCreate(BaseModel):
    player_id: str
    lobby_name: Optional[str] = None

class ShipPlacement(BaseModel):
    player_id: str
    ship_name: str
    x: int
    y: int
    orientation: str

#response models
class PlayerResponse(BaseModel):
    id: str
    name: str
    hits: int
    misses: int
    accuracy: float
    wins: int
    losses: int

class BoardResponse(BaseModel):
    width: int
    height: int
    grid: List[List[str]]

class GameBoardsResponse(BaseModel):
    player1_board: BoardResponse
    player2_board: BoardResponse

class GameResponse(BaseModel):
    game_id: str
    player1: PlayerResponse
    player2: PlayerResponse
    current_turn: str
    game_over: bool
    turn_count: int
    boards: GameBoardsResponse
    winner_id: Optional[str] = None

class LobbyResponse(BaseModel):
    id: str
    name: str
    host_name: str
    player_count: int

class LobbyListResponse(BaseModel):
    lobbies: List[LobbyResponse]

class LobbyJoinResponse(BaseModel):
    game_created: bool
    game_id: Optional[str] = None
    player1: Optional[PlayerResponse] = None
    player2: Optional[PlayerResponse] = None
    current_turn: Optional[str] = None
    boards: Optional[GameBoardsResponse] = None
    message: Optional[str] = None

class ShipPlacementResponse(BaseModel):
    success: bool
    message: str
    placed_ships: List[str]

class AttackResponse(BaseModel):
    result: str
    game_over: bool
    current_turn: str
    winner: Optional[str] = None
    winner_id: Optional[str] = None