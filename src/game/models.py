from pydantic import BaseModel
from typing import Optional

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