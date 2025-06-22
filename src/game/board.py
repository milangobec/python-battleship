import random
class Board:
    def __init__(self, width=10, height=10):
        self.width = width
        self.height = height
        self.grid = [['~' for _ in range(width)] for _ in range(height)]
        self.ships = []

    def calculate_ship_coords(self, ship, xpos, ypos, orientation):
        coords = []
        for i in range(ship.size):
            if orientation == 'horizontal':
                coords.append((xpos + i, ypos))
            if orientation == 'vertical':
                coords.append((xpos, ypos + i))
        return coords

    def is_valid_position(self, ship, xpos, ypos, orientation):
        if orientation == 'horizontal':
            if xpos + ship.size > self.width:
                raise ValueError("Ship cannot be placed horizontally here")
            for i in range(ship.size):
                if self.grid[ypos][xpos + i] != '~':
                    raise ValueError("Ship cannot be placed here, position already occupied")
        elif orientation == 'vertical':
            if ypos + ship.size > self.height:
                raise ValueError("Ship cannot be placed vertically here")
            for i in range(ship.size):
                if self.grid[ypos + i][xpos] != '~':
                    raise ValueError("Ship cannot be placed here, position already occupied")
        return True

    def place_ship(self, ship, xpos, ypos, orientation):
        if self.is_valid_position(ship, xpos, ypos, orientation):
            coords = self.calculate_ship_coords(ship, xpos, ypos, orientation)
            for x, y in coords:
                self.grid[y][x] = ship.name[0].upper()
            ship.xpos = xpos
            ship.ypos = ypos
            ship.orientation = orientation
            ship.coordinates = coords  # Use tuples
            self.ships.append(ship)
    
    def auto_place_ship(self, ship):
        while True:
            xpos = random.randint(0, self.width - 1)
            ypos = random.randint(0, self.height - 1)
            orientation = random.choice(['horizontal', 'vertical'])
            try:
                self.place_ship(ship, xpos, ypos, orientation)
                break
            except ValueError:
                continue
        #self.print_board()

    def recieve_attack(self, xpos, ypos):
        if self.grid[ypos][xpos] in ('x', 'o'):
            raise ValueError("this position has already been attacked.")
        for ship in self.ships:
            if (xpos, ypos) in ship.coordinates:
                self.grid[ypos][xpos] = 'x'
                ship.hits += 1
                return 'x'
        self.grid[ypos][xpos] = 'o'
        return 'o'

    def all_ships_sunk(self):
        return all(ship.hits >= ship.size for ship in self.ships)
    
    def get_masked_board(self):
        x = []
        for row in self.grid:
            masked_row = []
            for cell in row:
                if cell == 'x' or cell == 'o':
                    masked_row.append(cell)
                else:
                    masked_row.append('~')
            x.append(masked_row)
        return x
    
    def print_masked_board(self):
        x = self.get_masked_board()
        for row in x:
            print(' '.join(row))
    
    def to_dict_save(self):
        return {
            "width": self.width,
            "height": self.height,
            "grid": self.grid,
        }

    @classmethod
    def from_dict_save(cls, data):
        board = cls(data['width'], data['height'])
        board.grid = data['grid']
        return board
    
    def print_board(self):
        for row in self.grid:
            print(' '.join(row))
