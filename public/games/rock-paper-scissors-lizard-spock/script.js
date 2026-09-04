let extendedMode = true; // default extended (RPSLS)

function getOptions() {
  return extendedMode ? ["Rock", "Paper", "Scissors", "Lizard", "Spock"] : ["Rock", "Paper", "Scissors"];
}

function getRandomComputerResult() {
  const options = getOptions();
  const randomIndex = Math.floor(Math.random() * options.length);
  return options[randomIndex];
}

function hasPlayerWonTheRound(player, computer) {
  return (
    (player === "Rock" && (computer === "Scissors" || computer === "Lizard")) ||
    (player === "Scissors" && (computer === "Paper" || computer === "Lizard")) ||
    (player === "Paper" && (computer === "Rock" || computer === "Spock")) ||
    (player === "Lizard" && (computer === "Paper" || computer === "Spock")) ||
    (player === "Spock" && (computer === "Rock" || computer === "Scissors"))
  );
}

let playerScore = 0;
let computerScore = 0;

function getRoundResults(userOption) {
  const computerResult = getRandomComputerResult();
  animateChoice(userOption, computerResult);

  if (hasPlayerWonTheRound(userOption, computerResult)) {
    playerScore++;
    return `🎉 Player wins! ${userOption} beats ${computerResult}`;
  } else if (computerResult === userOption) {
    return `🤝 It's a tie! Both chose ${userOption}`;
  } else {
    computerScore++;
    return `💻 Computer wins! ${computerResult} beats ${userOption}`;
  }
}

const playerScoreSpanElement = document.getElementById("player-score");
const computerScoreSpanElement = document.getElementById("computer-score");
const roundResultsMsg = document.getElementById("results-msg");
const winnerMsgElement = document.getElementById("winner-msg");
const optionsContainer = document.querySelector(".options-container");
const resetGameBtn = document.getElementById("reset-game-btn");

function showResults(userOption) {
  roundResultsMsg.innerText = getRoundResults(userOption);
  roundResultsMsg.classList.add("flash");
  setTimeout(() => roundResultsMsg.classList.remove("flash"), 800);

  computerScoreSpanElement.innerText = computerScore;
  playerScoreSpanElement.innerText = playerScore;

  if (playerScore === 3 || computerScore === 3) {
    winnerMsgElement.innerText = `${playerScore === 3 ? "🏆 Player" : "💻 Computer"} has won the game!`;
    resetGameBtn.style.display = "block";
    optionsContainer.style.display = "none";
  }
}

function resetGame() {
  playerScore = 0;
  computerScore = 0;
  playerScoreSpanElement.innerText = 0;
  computerScoreSpanElement.innerText = 0;
  resetGameBtn.style.display = "none";
  optionsContainer.style.display = "block";
  winnerMsgElement.innerText = "";
  roundResultsMsg.innerText = "";
}

resetGameBtn.addEventListener("click", resetGame);

// Buttons
const rockBtn = document.getElementById("rock-btn");
const paperBtn = document.getElementById("paper-btn");
const scissorsBtn = document.getElementById("scissors-btn");
const lizardBtn = document.getElementById("lizard-btn");
const spockBtn = document.getElementById("spock-btn");

rockBtn.addEventListener("click", () => showResults("Rock"));
paperBtn.addEventListener("click", () => showResults("Paper"));
scissorsBtn.addEventListener("click", () => showResults("Scissors"));
lizardBtn.addEventListener("click", () => showResults("Lizard"));
spockBtn.addEventListener("click", () => showResults("Spock"));

// Toggle Extended/Normal Mode
const modeBtn = document.getElementById("modeToggleBtn");
modeBtn.addEventListener("click", () => {
  extendedMode = !extendedMode;
  document.querySelectorAll(".extended").forEach(btn => {
    btn.style.display = extendedMode ? "inline-block" : "none";
  });
  modeBtn.innerText = extendedMode ? "Switch to Normal Mode" : "Switch to Extended Mode";
  resetGame();
});

// Animation function
function animateChoice(player, computer) {
  const msg = document.getElementById("results-msg");
  msg.style.opacity = 0;
  setTimeout(() => {
    msg.style.opacity = 1;
    msg.innerText = `You chose ${player}, Computer chose ${computer}`;
  }, 200);
}
