import { teams } from "./data/teams.js";
import { gameState } from "./state/gameState.js";
import { renderTeamSelect } from "./render/renderTeamSelect.js";
import { createLiveMatch, playMinute } from "./services/liveMatchService.js";
import { renderLiveMatch } from "./render/renderLiveMatch.js";

const app = document.querySelector("#app");
const startGameBtn = document.querySelector("#startGameBtn");

let liveTimer = null;
let selectedTeam = null;
let opponents = [];
let opponentIndex = 0;

function startGame() {
  gameState.playedMatches = [];
  gameState.currentMatch = null;
  gameState.selectedTeamId = null;

  selectedTeam = null;
  opponents = [];
  opponentIndex = 0;

  app.innerHTML = renderTeamSelect(teams);

  document.querySelectorAll(".team-card").forEach((button) => {
    button.addEventListener("click", () => {
      gameState.selectedTeamId = button.dataset.teamId;

      selectedTeam = teams.find(
        (team) => String(team.id) === String(gameState.selectedTeamId)
      );

      opponents = teams.filter(
        (team) => String(team.id) !== String(gameState.selectedTeamId)
      );

      opponentIndex = 0;

      startNextMatch();
    });
  });
}

function startNextMatch() {
  const opponent = opponents[opponentIndex];

  if (!opponent) {
    renderTournamentSummary();
    return;
  }

  startLiveMatch(selectedTeam, opponent);
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

      savePlayedMatch(gameState.currentMatch);
      renderMatchFinished(gameState.currentMatch);
    }
  }, 700);
}

function savePlayedMatch(match) {
  gameState.playedMatches.push({
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    homeGoals: match.homeGoals,
    awayGoals: match.awayGoals,
    events: match.events,
    stats: match.stats
  });
}

function renderMatchFinished(match) {
  app.innerHTML = `
    ${renderLiveMatch(match, gameState.selectedTeamId)}

    <section class="match-finished-box">
      <h2>Kraj utakmice</h2>

      <h3>
        ${match.homeTeam.ime}
        ${match.homeGoals} : ${match.awayGoals}
        ${match.awayTeam.ime}
      </h3>

      <p>${getMatchResultMessage(match)}</p>

      <button id="nextMatchBtn" class="next-match-btn">
        Sledeća utakmica
      </button>
    </section>
  `;

  document.querySelector("#nextMatchBtn").addEventListener("click", () => {
    opponentIndex += 1;
    startNextMatch();
  });
}

function getMatchResultMessage(match) {
  if (match.homeGoals > match.awayGoals) {
    return `Pobednik je ${match.homeTeam.ime}. Idemo dalje!`;
  }

  if (match.awayGoals > match.homeGoals) {
    return `Pobednik je ${match.awayTeam.ime}. Idemo dalje!`;
  }

  return "Utakmica je završena nerešeno. Idemo dalje!";
}

function renderTournamentSummary() {
  app.innerHTML = `
    <section class="match-finished-box">
      <h2>Kraj serije utakmica</h2>
      <p>${selectedTeam.ime} je odigrao sve utakmice.</p>

      <h3>Istorija utakmica</h3>

      <div class="played-matches-list">
        ${gameState.playedMatches
          .map(
            (match) => `
              <div class="played-match-card">
                <strong>
                  ${match.homeTeam.ime}
                  ${match.homeGoals} : ${match.awayGoals}
                  ${match.awayTeam.ime}
                </strong>
              </div>
            `
          )
          .join("")}
      </div>

      <button id="restartGameBtn" class="next-match-btn">
        Pokreni novi turnir
      </button>
    </section>
  `;

  document.querySelector("#restartGameBtn").addEventListener("click", startGame);
}

startGameBtn.addEventListener("click", startGame);