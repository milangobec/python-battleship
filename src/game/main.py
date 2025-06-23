from ship import Ship
from player import Player
from board import Board
from storage import PlayerDataManager, GameStorage
from game import Game
import uuid

#Types of ships(size): carrier(5), battleship(4), cruiser(3), submarine(3), destroyer(2)    
def place_ships_for_player(player, available_ships):
    available_ship_names = list(available_ships.keys())
    placed_ships = []
    auto_mode = False
    board = player.board

    for i in range(5):
        while True:
            print(f"\nPlacing ship {i + 1}:")
            name = input("Enter ship name " + str(available_ship_names) + " or auto to auto-place ships: ").lower()
            
            if name == "auto":
                auto_mode = True
                for ship_name in available_ship_names:
                    size = available_ships[ship_name]
                    ship = Ship(ship_name, size, 0, 0, 'horizontal')
                    board.auto_place_ship(ship)
                    placed_ships.append(ship)
                break

            if name not in available_ship_names:
                print(f"{name} is not a valid ship name. Please choose from {available_ship_names}.")
                continue  

            size = available_ships[name]

            while True:
                try:
                    xpos = int(input("Enter ship x position (top-left corner, (1-10): ")) -1
                    if xpos < 0 or xpos >= board.width:
                        print("Invalid x position. Please enter a value between 1 and 10.")
                        continue
                    ypos = int(input("Enter ship y position (top-left corner, (1-10): ")) -1
                    if ypos < 0 or ypos >= board.height:
                        print("Invalid y position. Please enter a value between 1 and 10.")
                        continue
                    orientation = input("Enter ship orientation (horizontal/vertical): ")
                    if orientation not in ['horizontal', 'vertical']:
                        print("Invalid orientation. Please enter 'horizontal' or 'vertical'.")
                        continue
                    break
                except ValueError:
                    print("Invalid input. Please enter numeric values for positions.")
                    
            try:
                ship = Ship(name, size, xpos, ypos, orientation)
                board.place_ship(ship, xpos, ypos, orientation)
                placed_ships.append(ship)
                available_ships.pop(name, None)
                available_ship_names.remove(name)
                board.print_board()
                break
            except ValueError as e:
                print(f"Error placing ship: {e}")
                continue
            
        if auto_mode:
            break
    
    if auto_mode:
        print("\n")
        board.print_board()
        print("\n")
    
    return placed_ships

def get_or_create_player(mgr, player_num):
    while True:
        prompt = f"Player {player_num}, enter your player ID (or leave blank to auto-generate): "
        entered_id = input(prompt).strip()

        if not entered_id:
            new_id = str(uuid.uuid4())
            name = input(f"Player {player_num}, enter your name: ").strip()
            player = Player(name)
            player.id = new_id
            mgr.save_player(player)
            print(f"Registered new player: {name} with ID {new_id}. Welcome to Battleship! Remeber your ID for future games.")
            return player

        if mgr.player_exists(entered_id):
            player = mgr.get_player_profile(entered_id)
            print(f"Welcome back, {player.name}! (ID: {entered_id} )")
            return player

        print("Player ID not found. Please try again or leave blank to auto-generate a new ID.")

def main():
    player_id_manager = PlayerDataManager()
    game_storage = GameStorage()

    available_ships = {
        "carrier": 5,
        "battleship": 4,
        "cruiser": 3,
        "submarine": 3,
        "destroyer": 2
    }
    
    save_prompt = input("Do you want to load a saved game? (yes/no): ").strip().lower()
    
    load_success = False
    game = None

    if save_prompt == 'yes':
        game_id = input("Enter the game ID to load: ").strip()
        saved_game = game_storage.load_game(game_id)
        if game_id in game_storage.data and saved_game[0] is not None:
            game, player1, player2, board1, board2 = saved_game
            print(f"Loaded saved game with players {player1.name} and {player2.name}.")

            player_id_manager.save_player(player1)
            player_id_manager.save_player(player2)
            print("Game loaded successfully.")
            load_success = True
        else:
            print("No saved game found.")

    if not load_success:
        print("starting a new game...")
        player1 = get_or_create_player(player_id_manager, 1)
        player1.ships = place_ships_for_player(player1, available_ships.copy())

        player2 = get_or_create_player(player_id_manager, 2)
        player2.ships = place_ships_for_player(player2, available_ships.copy())

        player_id_manager.save_player(player1)
        player_id_manager.save_player(player2)

        game = Game(player1, player2, storage=game_storage)

    while not game.game_over:
        game.play_turn()
    
if __name__ == "__main__":
    main()