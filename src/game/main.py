#Types of ships(size): carrier(5), battleship(4), cruiser(3), submarine(3), destroyer(2)
class Ship:
    def __init__(self, name, size, xpos, ypos, orientation):
        self.name = name
        self.size = size
        self.xpos = xpos
        self.ypos = ypos
        self.orientation = orientation
        self.coordinates = []
    
    #Calculates the coordinates of a given ship based on its starting coorinates, size, and orientation
    def calculate_coordinates(self):
        self.coordinates = []
        for i in range(self.size):
            if self.orientation == 'horizontal':
                self.coordinates.append((self.xpos + i, self.ypos))
            else:
                self.coordinates.append((self.xpos, self.ypos + i))
    
class Board:
    def __init__(self, width=10, height=10):
        self.width = width
        self.height = height
        self.grid = [['~' for _ in range(width)] for _ in range(height)]
        self.ships = []
    
    def calculcate_ship_positions(self, ship, xpos, ypos, orientation):
        positions = []
        for i in range(ship.size):
            if ship.orientation == 'horizontal':
                positions.append((xpos + i, ypos))
            if ship.orientation == 'vertical':
                positions.append((xpos, ypos + i))
        return positions
    
    #checks to see whether a ship can be placed at a given position
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
    
    # Places a ship on the board if the position is valid
    def place_ship(self, ship, xpos, ypos, orientation):
        if self.is_valid_position(ship, xpos, ypos, orientation):
            positions = self.calculcate_ship_positions(ship, xpos, ypos, orientation)
            for x, y in positions:
                self.grid[y][x] = ship.name[0].upper()
            ship.positions = positions
            self.ships.append(ship)
    
    def print_board(self):
        for row in self.grid:
            print(' '.join(row))
        print()

board = Board()

def main():
    available_ships = {
        "carrier": 5,
        "battleship": 4,
        "cruiser": 3,
        "submarine": 3,
        "destroyer": 2
    }
    ship_names = list(available_ships.keys())
    placed_ships = []
    board = Board()

    for i in range(5):
        while True:
            print(f"\nPlacing ship {i + 1}:")
            name = input("Enter ship name " + str(ship_names) + ": ").lower()
            if name not in available_ships:
                print("Invalid ship name. Please try again.")
                continue

            size = available_ships[name]

            available_ships.pop(name, None)
            ship_names.remove(name)

            if any(ship.name == name for ship in placed_ships):
                print(f"{name} has already been placed. Please choose a different ship.")
                continue

            while True:
                xpos = int(input("Enter ship x position (top-left corner, (0-9): "))
                if xpos < 0 or xpos >= board.width:
                    print("Invalid x position. Please enter a value between 0 and 9.")
                    continue
                ypos = int(input("Enter ship y position (top-left corner, (0-9): "))
                if ypos < 0 or ypos >= board.height:
                    print("Invalid y position. Please enter a value between 0 and 9.")
                    continue
                orientation = input("Enter ship orientation (horizontal/vertical): ")
                if orientation not in ['horizontal', 'vertical']:
                    print("Invalid orientation. Please enter 'horizontal' or 'vertical'.")
                    continue
                break        
            try:
                ship = Ship(name, size, xpos, ypos, orientation)
                ship.calculate_coordinates()
                board.place_ship(ship, xpos, ypos, orientation)
                placed_ships.append(ship)
            except ValueError as e:
                print(f"Error placing ship: {e}")
                continue
            
            board.print_board()
            break

if __name__ == "__main__":
    main()