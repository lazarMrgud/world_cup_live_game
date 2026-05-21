import { teams } from "./data/teams.js";
import { gameState } from "./state/gameState.js";
import { renderTeamSelect } from "./render/renderTeamSelect.js";
import { createLiveMatch, playMinute } from "./services/liveMatchService.js";
import { renderLiveMatch } from "./render/renderLiveMatch.js";
import { createRandomGroups, findTeamGroup } from "./services/groupService.js";
import { createGroupSchedule } from "./services/scheduleService.js";
import {
  calculateGroupTable,
  getQualifiedTeamsFromTable
} from "./services/tableService.js";

import { renderGroupTable } from "./render/renderGroupTable.js";

const app = document.querySelector("#app");
const startGameBtn = document.querySelector("#startGameBtn");

let liveTimer = null;

function startGame() {
  resetGame();

  app.innerHTML = renderTeamSelect(teams);

  document.querySelectorAll(".team-card").forEach((button) => {
    button.addEventListener("click", () => {
      selectTeam(button.dataset.teamId);
    });
  });
}

function resetGame() {
  gameState.selectedTeamId = null;
  gameState.selectedTeam = null;
  gameState.groups = {};
  gameState.selectedGroupName = null;
  gameState.selectedGroupTeams = [];
  gameState.schedule = [];
  gameState.currentMatchIndex = 0;
  gameState.currentMatch = null;
  gameState.playedMatches = [];

  if (liveTimer) {
    clearInterval(liveTimer);
    liveTimer = null;
  }
}

function selectTeam(teamId) {
  gameState.selectedTeamId = teamId;

  gameState.groups = createRandomGroups(teams);

  const selectedGroup = findTeamGroup(gameState.groups, teamId);

  if (!selectedGroup) {
    app.innerHTML = "<h2>Greška: izabrani tim nije pronađen u grupi.</h2>";
    return;
  }

  const [groupName, groupTeams] = selectedGroup;

  gameState.selectedGroupName = groupName;
  gameState.selectedGroupTeams = groupTeams;

  gameState.selectedTeam = groupTeams.find(
    (team) => String(team.id) === String(teamId)
  );

  gameState.schedule = createGroupSchedule(groupName, groupTeams);
  gameState.currentMatchIndex = 0;

  renderGroupIntro();
}

function renderGroupIntro() {
  app.innerHTML = `
    <section class="group-intro">
      <h2>Izabrao si: ${gameState.selectedTeam.ime}</h2>
      <p>Tvoj tim je u grupi: <strong>${gameState.selectedGroupName}</strong></p>

      <div class="group-teams-list">
        ${gameState.selectedGroupTeams
          .map(
            (team) => `
              <div class="group-team-card ${
                String(team.id) === String(gameState.selectedTeamId)
                  ? "selected-group-team"
                  : ""
              }">
                <img src="${team.slika}" alt="${team.ime}">
                <h3>${team.ime}</h3>
              </div>
            `
          )
          .join("")}
      </div>

      <button id="startGroupMatchesBtn" class="next-match-btn">
        Pokreni utakmice u grupi
      </button>
    </section>
  `;

  document
    .querySelector("#startGroupMatchesBtn")
    .addEventListener("click", startNextGroupMatch);
}

function startNextGroupMatch() {
  const match = gameState.schedule[gameState.currentMatchIndex];

  if (!match) {
    renderGroupFinished();
    return;
  }

  startLiveMatch(match.homeTeam, match.awayTeam);
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
  }, 100);
}

function savePlayedMatch(match) {
  gameState.playedMatches.push({
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    homeGoals: match.homeGoals,
    awayGoals: match.awayGoals,
    events: match.events,
    stats: match.stats,
    round: gameState.schedule[gameState.currentMatchIndex].round,
    group: gameState.selectedGroupName
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
        Sledeća utakmica u grupi
      </button>
    </section>
  `;

  document.querySelector("#nextMatchBtn").addEventListener("click", () => {
    gameState.currentMatchIndex += 1;
    startNextGroupMatch();
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

function renderGroupFinished() {
  const groupTable = calculateGroupTable(
    gameState.selectedGroupTeams,
    gameState.playedMatches
  );

  const qualifiedTeams = getQualifiedTeamsFromTable(groupTable);

  const selectedTeamQualified = qualifiedTeams.some(
    (team) => String(team.id) === String(gameState.selectedTeamId)
  );

  app.innerHTML = `
    <section class="match-finished-box">
      <h2>Kraj utakmica u grupi</h2>
      <p>Grupa ${gameState.selectedGroupName} je završena.</p>

      ${renderGroupTable(
        gameState.selectedGroupName,
        groupTable,
        gameState.selectedTeamId
      )}

      <h3>Timovi koji idu dalje</h3>

      <div class="qualified-teams-list">
        ${qualifiedTeams
          .map(
            (team) => `
              <div class="qualified-team-card">
                <img src="${team.slika}" alt="${team.ime}">
                <strong>${team.ime}</strong>
              </div>
            `
          )
          .join("")}
      </div>

      <h3>
        ${
          selectedTeamQualified
            ? `${gameState.selectedTeam.ime} ide u veći rang!`
            : `${gameState.selectedTeam.ime} je ispao u grupi.`
        }
      </h3>

      <button id="restartGameBtn" class="next-match-btn">
        Pokreni novi turnir
      </button>
    </section>
  `;

  document.querySelector("#restartGameBtn").addEventListener("click", startGame);
}

startGameBtn.addEventListener("click", startGame);