from player import Player
from board import Board
from storage import PlayerDataManager, GameStorage
import random

board = Board
player = Player

class Game:
    def __init__(self, player1, player2):
        self.player1 = player1
        self.player2 = player2
        self.board1 = player1.board
        self.board2 = player2.board

        random_turn = random.randint(0, 1)
        if random_turn == 0:
            self.current_turn = player1
            self.opponent = player2
        else:
            self.current_turn = player2
            self.opponent = player1

        self.game_over = False
        self.turn_count = 0

    def switch_turn(self):
        if self.current_turn == self.player1:
            self.current_turn = self.player2
            self.opponent = self.player1
        else:
            self.current_turn = self.player1
            self.opponent = self.player2
        
    def play_turn(self):
        if self.game_over:
            print("Game is already over.")
            return
            
        print(f"{self.current_turn.name}'s turn. Here is {self.opponent.name}'s board...\n")
        self.opponent.board.print_masked_board()
        x, y = self.get_attack_coordinates()


        try:
            result = self.opponent.board.recieve_attack(x, y)
            if result == 'x':
                print("Hit!\n")
                self.current_turn.record_hit()
                if self.opponent.board.all_ships_sunk():
                    print(f"{self.current_turn.name} wins!")
                    self.game_over = True
            else:
                print("Miss...\n")
                self.current_turn.record_miss()
            if not self.game_over:
                print("")
                print(f"{self.opponent.name}'s board: ")
                self.opponent.board.print_masked_board()
                print("")
                self.switch_turn()
                self.turn_count += 1
                if self.turn_count % 4 == 0:
                    save_prompt = input("Do you want to save the game? (yes/no) !*Saving will overwrite the original save*! : ").strip().lower()
                    while save_prompt not in ['yes', 'no']:
                        save_prompt = input("Invalid input. Please enter 'yes' or 'no': ").strip().lower()
                    if save_prompt == 'yes':
                        print("saved game.")
                        mgr = PlayerDataManager()
                        sotrage = GameStorage()
                        mgr.save_player(self.player1)
                        mgr.save_player(self.player2)
                        self.winner_name = self.check_winner()
                        new_game_id = sotrage.save_game(self, self.player1, self.player2, self.board1, self.board2)
                        print(f"Game saved successfully with ID: {new_game_id}")
                        self.game_over = True
                        return
                    elif save_prompt == 'no':
                        print("did not save game.")
                        print("Continuing the game...")
        except ValueError as e:
            print(e)
            
    def get_attack_coordinates(self):
        while True:
            try:
                coords = input(f"{self.current_turn.name}, enter attack coordinates as 'x y' (1 - {self.current_turn.board.width}): ")
                x_str, y_str = coords.strip().split()
                x, y = int(x_str) -1 , int(y_str) - 1
                if not (0 <= x < self.current_turn.board.width and 0 <= y < self.current_turn.board.height):
                    print("Coordinates out of bounds. Try again.")
                    continue
                if (x, y) in self.current_turn.targets:
                    print("You already attacked this position. Try again.")
                    continue
                self.current_turn.targets.add((x, y))
                return x, y
            except ValueError:
                print("Invalid input. Please enter coordinates in the format 'x y'.")
                
    def start_game(self):
        print(f"Starting game between {self.player1.name} and {self.player2.name}.")
        while not self.game_over:
            self.play_turn()
        print("Game over!")

    def check_winner(self):
        if self.player1.board.all_ships_sunk():
            return self.player2.name
        elif self.player2.board.all_ships_sunk():
            return self.player1.name
        return None

    def reset_game(self):
        self.player1.board = Board()
        self.player2.board = Board()
        self.player1.ships.clear()
        self.player2.ships.clear()
        self.current_turn = random.choice([self.player1, self.player2])
        self.opponent = self.player2 if self.current_turn == self.player1 else self.player1
        self.game_over = False
        print("Game has been reset.")

    def get_game_state(self):
        return {
            "current_turn": self.current_turn.name,
            "game_over": self.game_over,
            "turn_count": self.turn_count
        }
        
    def to_dict(self):
        return {
            "current_turn": self.current_turn.id,
            "game_over": self.game_over,
            "turn_count": self.turn_count
        }
        
    @classmethod
    def from_dict(cls, data, player1, player2):
        game = cls(player1, player2)
        game.current_turn = player1 if data['current_turn'] == player1.id else player2
        game.game_over = data['game_over']
        game.turn_count = data['turn_count']
        game.winner_name = data.get('winner_name', None)
        return game

        