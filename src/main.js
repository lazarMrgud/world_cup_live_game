import { teams } from "./data/teams.js";
import { gameState } from "./state/gameState.js";
import { renderTeamSelect } from "./render/renderTeamSelect.js";
import { createLiveMatch, playMinute } from "./services/liveMatchService.js";
import { renderLiveMatch } from "./render/renderLiveMatch.js";

const app = document.querySelector("#app");
const startGameBtn = document.querySelector("#startGameBtn");

let liveTimer = null;

function startGame() {
  app.innerHTML = renderTeamSelect(teams);

  document.querySelectorAll(".team-card").forEach((button) => {
    button.addEventListener("click", () => {
      gameState.selectedTeamId = button.dataset.teamId;

      const selectedTeam = teams.find(
        (team) => String(team.id) === String(gameState.selectedTeamId)
      );

      const opponent = teams.find(
        (team) => String(team.id) !== String(gameState.selectedTeamId)
      );

      startLiveMatch(selectedTeam, opponent);
    });
  });
}

function startLiveMatch(homeTeam, awayTeam) {
  if (liveTimer) {
    clearInterval(liveTimer);
  }

  gameState.currentMatch = createLiveMatch(homeTeam, awayTeam);

  liveTimer = setInterval(() => {
    playMinute(gameState.currentMatch);

    app.innerHTML = renderLiveMatch(
      gameState.currentMatch,
      gameState.selectedTeamId
    );

    if (gameState.currentMatch.isFinished) {
      clearInterval(liveTimer);
      liveTimer = null;
    }
  }, 350);
}

startGameBtn.addEventListener("click", startGame);