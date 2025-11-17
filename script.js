// Creates and manages the gameboard state and checks for wins/draws.
const Gameboard = (function () {
  let board = Array(9).fill("");

  const winArray = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // cols
    [0, 4, 8],
    [2, 4, 6], // diagonals
  ];

  // Returns a copy of the board.
  function readGameboard() {
    return [...board];
  }

  // Writes a marker if the spot is empty, returns true on success.
  function writeGameboard(index, marker) {
    if (board[index] === "") {
      board[index] = marker;
      return true;
    }
    return false;
  }

  // Returns 'X' or 'O' for winner, 'draw' for full no-win, false to continue.
  function checkWinner() {
    const winningCombo = winArray.find((combo) => {
      const [a, b, c] = combo;
      const cellA = board[a];
      return cellA !== "" && cellA === board[b] && cellA === board[c];
    });

    if (winningCombo) {
      return board[winningCombo[0]];
    }

    if (board.includes("")) {
      return false; // game continues
    }

    return "draw";
  }

  // Resets the board to empty.
  function resetBoard() {
    board = Array(9).fill("");
  }

  return { readGameboard, writeGameboard, checkWinner, resetBoard };
})();

// Factory for player objects.
const player = (name, marker) => ({ name, marker });

// Controls all DOM updates, event binding, and board interactivity.
const displayController = (function () {
  let gameActive = false;

  // Sets the internal active state and also toggles cell interactivity.
  const setBoardActive = (status) => {
    gameActive = Boolean(status);
    const cells = document.querySelectorAll(".cell");
    cells.forEach((cell) => {
      cell.style.pointerEvents = gameActive ? "auto" : "none";
      cell.style.cursor = gameActive ? "pointer" : "default";
    });
  };

  // Toggles Start / Reset button visibility.
  function toggleButtons(showStart) {
    const startButton = document.getElementById("startButton");
    const resetButton = document.getElementById("resetButton");

    if (startButton) startButton.style.display = showStart ? "flex" : "none";
    if (resetButton) resetButton.style.display = showStart ? "none" : "flex";
  }

  // Updates UI cells from the Gameboard state.
  function updateDisplay() {
    const boardState = Gameboard.readGameboard();
    for (let i = 0; i < boardState.length; i++) {
      const cellElement = document.getElementById(String(i));
      if (cellElement) cellElement.textContent = boardState[i];
    }
  }

  // Sets the result message area text.
  function setMessage(message) {
    const messageElement = document.getElementById("resultMessage");
    if (messageElement) messageElement.textContent = message;
  }

  // Binds clicks on cells (delegation) and keyboard enter/space for accessibility.
  function bindBoardEvents() {
    const container = document.getElementById("boardContainer");
    if (!container) return;

    container.addEventListener("click", (e) => {
      const target = e.target;
      if (!target.classList.contains("cell")) return;
      const index = Number(target.id);
      if (Number.isFinite(index)) {
        if (!gameActive) return;
        gameController.playRound(index);
      }
    });

    // Allow keyboard activation (Enter/Space) for accessibility
    container.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        const target = e.target;
        if (!target.classList.contains("cell")) return;
        const index = Number(target.id);
        if (Number.isFinite(index)) {
          e.preventDefault();
          if (!gameActive) return;
          gameController.playRound(index);
        }
      }
    });
  }

  // Initializes UI: binds start/reset and board events, sets initial visuals.
  function initialize() {
    const startButton = document.getElementById("startButton");
    const resetButton = document.getElementById("resetButton");

    if (startButton) {
      startButton.addEventListener("click", () => {
        const p1Name =
          document.getElementById("p1NameInput").value || "Player 1";
        const p2Name =
          document.getElementById("p2NameInput").value || "Player 2";

        gameController.startGame(p1Name.trim(), p2Name.trim());
        Gameboard.resetBoard();
        updateDisplay();
        setMessage("");
        setBoardActive(true);
        toggleButtons(false); // hide start, show reset
      });
    }

    if (resetButton) {
      resetButton.addEventListener("click", () => {
        // Reset should clear the board and allow play immediately
        Gameboard.resetBoard();
        updateDisplay();
        setMessage("");
        setBoardActive(true);
        toggleButtons(false); // keep reset visible because we're in an active game
        // Also ensure active player is reset to playerOne
        gameController.resetGame(); // OK to reset turn order/state (doesn't clear board)
      });
    }

    bindBoardEvents();
    // initial UI state
    Gameboard.resetBoard();
    updateDisplay();
    setMessage("");
    toggleButtons(true);
    setBoardActive(false);
  }

  return {
    initialize,
    updateDisplay,
    setMessage,
    setBoardActive,
  };
})();

// Manages game flow, turns and uses Gameboard + displayController.
const gameController = (function () {
  let playerOne = player("Player 1", "X");
  let playerTwo = player("Player 2", "O");
  let activePlayer = playerOne;

  // Sets up player names and initializes first turn.
  function startGame(p1Name, p2Name) {
    playerOne = player(p1Name || "Player 1", "X");
    playerTwo = player(p2Name || "Player 2", "O");
    activePlayer = playerOne;
  }

  // Resets any game-specific state; keep players intact.
  function resetGame() {
    Gameboard.resetBoard();
    activePlayer = playerOne;
  }

  // Switches the active player.
  const switchPlayerTurn = () => {
    activePlayer = activePlayer === playerOne ? playerTwo : playerOne;
  };

  // Handles a player's move at index, updates UI, checks for end state.
  function playRound(index) {
    const idx = Number(index);
    if (!Number.isFinite(idx) || idx < 0 || idx > 8) return;

    // Prevent move if spot is taken
    const success = Gameboard.writeGameboard(idx, activePlayer.marker);
    if (!success) return;

    displayController.updateDisplay();

    const result = Gameboard.checkWinner();

    if (result === "draw") {
      displayController.setMessage("🤝 It's a draw! 🤝");
      displayController.setBoardActive(false); // freeze board so players can see final state
      return;
    }

    if (result === "X") {
      displayController.setMessage(`🎉 ${playerOne.name} wins! 🎉`);
      displayController.setBoardActive(false); // freeze board
      return;
    }

    if (result === "O") {
      displayController.setMessage(`🎉 ${playerTwo.name} wins! 🎉`);
      displayController.setBoardActive(false); // freeze board
      return;
    }

    // Continue game
    switchPlayerTurn();
  }

  return { startGame, resetGame, playRound };
})();

// Kick things off when DOM is ready.
document.addEventListener("DOMContentLoaded", () => {
  displayController.initialize();
});
