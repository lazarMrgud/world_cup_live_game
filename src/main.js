import { teams } from "./data/teams.js";
import { gameState } from "./state/gameState.js";
import { renderTeamSelect } from "./render/renderTeamSelect.js";
import { createLiveMatch, playMinute } from "./services/liveMatchService.js";
import { renderLiveMatch } from "./render/renderLiveMatch.js";
import { createRandomGroups, findTeamGroup } from "./services/groupService.js";
const knockoutTournament = createKnockoutTournamentFromGroups(
  worldCupGroups.allGroupResults
);
import {
  createGroupSchedule,
  getSelectedTeamMatches,
  getOtherGroupMatches
} from "./services/scheduleService.js";
import {
  calculateGroupTable,
  getQualifiedTeamsFromTable
} from "./services/tableService.js";

import { renderGroupTable } from "./render/renderGroupTable.js";
import {
  simulateRestOfWorldCupGroups,
  createKnockoutTournamentFromGroups
} from "./services/worldCupService.js";

import { renderWorldCupSummary } from "./render/renderWorldCupSummary.js";
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

gameState.selectedTeamSchedule = getSelectedTeamMatches(
  gameState.schedule,
  gameState.selectedTeamId
);

gameState.otherGroupSchedule = getOtherGroupMatches(
  gameState.schedule,
  gameState.selectedTeamId
);

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
  const match = gameState.selectedTeamSchedule[gameState.currentMatchIndex];

  if (!match) {
    simulateOtherGroupMatches();
    renderGroupFinished();
    return;
  }

  startLiveMatch(match.homeTeam, match.awayTeam);
}
function simulateOtherGroupMatches() {
  const simulatedMatches = gameState.otherGroupSchedule.map((match) => {
    return {
      ...match,
      homeGoals: getRandomGoals(),
      awayGoals: getRandomGoals(),
      events: [],
      stats: null
    };
  });

  gameState.playedMatches.push(...simulatedMatches);
}

function getRandomGoals() {
  return Math.floor(Math.random() * 5);
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
   round: gameState.selectedTeamSchedule[gameState.currentMatchIndex].round,
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

      <h3>Timovi koji idu dalje iz tvoje grupe</h3>

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

      <button id="continueWorldCupBtn" class="next-match-btn">
        Nastavi Svetsko prvenstvo
      </button>
    </section>
  `;

  document
    .querySelector("#continueWorldCupBtn")
    .addEventListener("click", continueWorldCupToFinal);
}

function continueWorldCupToFinal() {
  const worldCupGroups = simulateRestOfWorldCupGroups(
    gameState.groups,
    gameState.selectedGroupName,
    gameState.playedMatches
  );

  const knockoutTournament = createKnockoutTournament(
    worldCupGroups.allQualifiedTeams
  );

  function renderSummary(showChampion = false) {
    app.innerHTML = renderWorldCupSummary({
      allGroupResults: worldCupGroups.allGroupResults,
      knockoutTournament,
      selectedTeamId: gameState.selectedTeamId,
      showChampion
    });

    document
      .querySelector("#restartGameBtn")
      .addEventListener("click", startGame);

    const watchFinalBtn = document.querySelector("#watchFinalBtn");
    const showChampionBtn = document.querySelector("#showChampionBtn");

    if (watchFinalBtn) {
      watchFinalBtn.addEventListener("click", () => {
        const finalMatch = knockoutTournament.finalMatch;
        startLiveFinalMatch(finalMatch, knockoutTournament.champion);
      });
    }

    if (showChampionBtn) {
      showChampionBtn.addEventListener("click", () => {
        renderSummary(true);
      });
    }
  }

  renderSummary(false);
}


function startLiveFinalMatch(finalMatch, champion) {
  if (liveTimer) {
    clearInterval(liveTimer);
  }

  gameState.currentMatch = createLiveMatch(
    finalMatch.homeTeam,
    finalMatch.awayTeam
  );

  liveTimer = setInterval(() => {
    playMinute(gameState.currentMatch);

    app.innerHTML = renderLiveMatch(
      gameState.currentMatch,
      gameState.selectedTeamId
    );

    if (gameState.currentMatch.isFinished) {
      clearInterval(liveTimer);
      liveTimer = null;

      app.innerHTML = `
        ${renderLiveMatch(gameState.currentMatch, gameState.selectedTeamId)}

        <section class="world-champion-box">
          <h2>Finale je završeno</h2>
          <h3>
            ${gameState.currentMatch.homeTeam.ime}
            ${gameState.currentMatch.homeGoals} :
            ${gameState.currentMatch.awayGoals}
            ${gameState.currentMatch.awayTeam.ime}
          </h3>

          <h2>Šampion sveta</h2>
          <img src="${champion.slika}" alt="${champion.ime}">
          <h1>${champion.ime}</h1>

          <button id="restartGameBtn" class="next-match-btn">
            Vrati na početak / biraj ponovo svoj tim
          </button>
        </section>
      `;

      document
        .querySelector("#restartGameBtn")
        .addEventListener("click", startGame);
    }
  }, 250);
}


startGameBtn.addEventListener("click", startGame);