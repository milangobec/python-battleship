import uuid
from board import Board

class Player:
    def __init__(self, name, board=None):
        self.id = str(uuid.uuid4())
        
        if board is None:
            self.board = Board()
        else:
            self.board = board

        self.name = name
        self.ships = []
        self.targets = set()
        self.hits = 0
        self.misses = 0
        self.accuracy = 0.0
        self.wins = 0
        self.losses = 0
    
    def place_ship(self, ship, xpos, ypos, orientation):
        try:
            self.board.place_ship(ship, xpos, ypos, orientation)
            self.ships.append(ship)
        except ValueError as e:
            print(f"Error placing ship: {e}")
    
    def add_target(self, x, y):
        if (x, y) not in self.targets:
            self.targets.add((x, y))
        else:
            print(f"Target ({x}, {y}) already exists for player {self.name}.")
            print("Please choose a different target.")
    
    def record_hit(self):
        self.hits += 1
    
    def record_miss(self):
        self.misses += 1

    def record_win(self):
        self.wins += 1
    
    def record_loss(self):
        self.losses += 1
    
    def get_player_info(self):
        return {
            "id": self.id,
            "name": self.name,
        }

    def calculate_accuracy(self):
        if self.hits + self.misses == 0:
            return 0.0
        return (self.hits / (self.hits + self.misses)) * 100

    def to_dict_profile(self):
        return {
            "id": self.id,
            "name": self.name,
            "hits": self.hits,
            "misses": self.misses,
            "accuracy": self.calculate_accuracy(),
            "wins": self.wins,
            "losses": self.losses
        }
    
    @classmethod
    def from_dict_profile(cls, data):
        player = cls(data['name'])
        player.id = data['id']
        player.hits = data['hits']
        player.misses = data['misses']
        player.accuracy = data['accuracy']
        player.wins = data['wins']
        player.losses = data['losses']
        return player

    def has_lost(self):
        return len(self.ships) == 0