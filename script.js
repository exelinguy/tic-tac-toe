// Gameboard IIFE (Data & Rules)
const Gameboard = (function () {
  let board = ["", "", "", "", "", "", "", "", ""];
  // Winning conditions created once in module scope (Efficient)
  const winArray = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // Rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // Columns
    [0, 4, 8],
    [2, 4, 6], // Diagonals
  ];

  function readGameboard() {
    return [...board]; // Returns a safe copy (Encapsulation)
  }

  function writeGameboard(index, marker) {
    if (board[index] === "") {
      board[index] = marker;
      return true; // Success
    }
    return false; // Failure (spot already taken)
  }

  // Functional check for winner using .find()
  function checkWinner() {
    const winningCombo = winArray.find((combo) => {
      const cellA = board[combo[0]];
      const cellB = board[combo[1]];
      const cellC = board[combo[2]];
      return cellA !== "" && cellA === cellB && cellA === cellC;
    });

    if (winningCombo) {
      return board[winningCombo[0]]; // Returns 'X' or 'O'
    }

    // Check for draw/continue
    if (board.includes("")) {
      return false; // Game continues
    } else {
      return "draw";
    }
  }

  // Clean void function for resetting state (Style Consistency)
  function resetBoard() {
    board = ["", "", "", "", "", "", "", "", ""];
  }

  return { checkWinner, readGameboard, writeGameboard, resetBoard };
})();

// Player factory function
const player = (name, marker) => {
  return { name, marker };
};

// Game controller (Flow & State)
const gameController = (function () {
  let playerOne = player("", "X");
  let playerTwo = player("", "O");
  let activePlayer;

  function startGame(p1Name, p2Name) {
    playerOne = player(p1Name, "X");
    playerTwo = player(p2Name, "O");
    activePlayer = playerOne;
  }

  const resetGame = () => {
    Gameboard.resetBoard();
    activePlayer = playerOne;
  };

  const switchPlayerTurn = () => {
    activePlayer = activePlayer === playerOne ? playerTwo : playerOne;
  };

  function playRound(index) {
    // Guards against invalid moves by checking writeGameboard's return value
    if (!Gameboard.writeGameboard(index, activePlayer.marker)) {
      return;
    }

    const result = Gameboard.checkWinner();

    // Switch handles logging and flow control
    switch (result) {
      case "draw":
        console.log("It's a draw!");
        break;
      case "X":
        console.log(`${playerOne.name} wins!`);
        break;
      case "O":
        console.log(`${playerTwo.name} wins!`);
        break;
      default:
        switchPlayerTurn(); // Only switch turns if the game is NOT over
    }

    // Consolidated Game Over Reset (DRY Principle)
    if (["draw", "X", "O"].includes(result)) {
      resetGame();
    }
  }

  return { playRound, startGame };
})();
