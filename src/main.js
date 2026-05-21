import { teams } from "./data/teams.js";
import { gameState } from "./state/gameState.js";
import { renderTeamSelect } from "./render/renderTeamSelect.js";
import { createLiveMatch, playMinute } from "./services/liveMatchService.js";
import { renderLiveMatch } from "./render/renderLiveMatch.js";
import { createRandomGroups, findTeamGroup } from "./services/groupService.js";
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

const MATCH_SPEED = 180;

const app = document.querySelector("#app");
const startGameBtn = document.querySelector("#startGameBtn");

let liveTimer = null;
let cachedWorldCupGroups = null;
let cachedKnockoutTournament = null;

function startGame() {
  resetGame();
  app.innerHTML = renderTeamSelect(teams);

  document.querySelectorAll(".team-card").forEach((button) => {
    button.addEventListener("click", () => selectTeam(button.dataset.teamId));
  });
}

function resetGame() {
  gameState.selectedTeamId = null;
  gameState.selectedTeam = null;
  gameState.groups = {};
  gameState.selectedGroupName = null;
  gameState.selectedGroupTeams = [];
  gameState.schedule = [];
  gameState.selectedTeamSchedule = [];
  gameState.otherGroupSchedule = [];
  gameState.currentMatchIndex = 0;
  gameState.currentMatch = null;
  gameState.playedMatches = [];

  cachedWorldCupGroups = null;
  cachedKnockoutTournament = null;

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
    app.innerHTML = `<h2>Greška: izabrani tim nije pronađen u grupi.</h2>`;
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
      <p>Uživo pratiš samo utakmice svog tima. Ostale utakmice grupe se simuliraju u pozadini.</p>

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
        Pokreni utakmice mog tima
      </button>
    </section>
  `;

  document
    .querySelector("#startGroupMatchesBtn")
    .addEventListener("click", startNextSelectedTeamMatch);
}

function startNextSelectedTeamMatch() {
  const match = gameState.selectedTeamSchedule[gameState.currentMatchIndex];

  if (!match) {
    simulateOtherGroupMatches();
    renderGroupFinished();
    return;
  }

  startLiveMatch(match.homeTeam, match.awayTeam, handleGroupMatchFinished);
}

function simulateOtherGroupMatches() {
  const alreadySimulated = gameState.playedMatches.some(
    (match) => match.isBackgroundSimulation
  );

  if (alreadySimulated) return;

  const simulatedMatches = gameState.otherGroupSchedule.map((match) => ({
    ...match,
    homeGoals: getRandomGoals(),
    awayGoals: getRandomGoals(),
    events: [],
    stats: null,
    round: match.round,
    group: match.group,
    isBackgroundSimulation: true
  }));

  gameState.playedMatches.push(...simulatedMatches);
}

function startLiveMatch(homeTeam, awayTeam, onFinished) {
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
      onFinished(gameState.currentMatch);
    }
  }, MATCH_SPEED);
}

function handleGroupMatchFinished(match) {
  savePlayedMatch(match);
  renderGroupMatchFinished(match);
}

function savePlayedMatch(match) {
  const scheduleMatch = gameState.selectedTeamSchedule[gameState.currentMatchIndex];

  gameState.playedMatches.push({
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    homeGoals: match.homeGoals,
    awayGoals: match.awayGoals,
    events: match.events,
    stats: match.stats,
    round: scheduleMatch.round,
    group: gameState.selectedGroupName,
    isBackgroundSimulation: false
  });
}

function renderGroupMatchFinished(match) {
  app.innerHTML = `
    ${renderLiveMatch(match, gameState.selectedTeamId)}

    <section class="match-finished-box">
      <h2>Kraj utakmice</h2>
      <h3>${match.homeTeam.ime} ${match.homeGoals} : ${match.awayGoals} ${match.awayTeam.ime}</h3>
      <p>${getMatchResultMessage(match)}</p>

      <button id="nextMatchBtn" class="next-match-btn">
        Sledeća utakmica mog tima
      </button>
    </section>
  `;

  document.querySelector("#nextMatchBtn").addEventListener("click", () => {
    gameState.currentMatchIndex += 1;
    startNextSelectedTeamMatch();
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
  cachedWorldCupGroups = simulateRestOfWorldCupGroups(
    gameState.groups,
    gameState.selectedGroupName,
    gameState.playedMatches
  );

  cachedKnockoutTournament = createKnockoutTournamentFromGroups(
    cachedWorldCupGroups.allGroupResults
  );

  renderWorldCupSummaryScreen(false);
}

function renderWorldCupSummaryScreen(showChampion = false) {
  app.innerHTML = renderWorldCupSummary({
    allGroupResults: cachedWorldCupGroups.allGroupResults,
    knockoutTournament: cachedKnockoutTournament,
    selectedTeamId: gameState.selectedTeamId,
    showChampion
  });

  document.querySelector("#restartGameBtn").addEventListener("click", startGame);

  const watchFinalBtn = document.querySelector("#watchFinalBtn");
  const showChampionBtn = document.querySelector("#showChampionBtn");

  if (watchFinalBtn) {
    watchFinalBtn.addEventListener("click", () => {
      startLiveFinalMatch(cachedKnockoutTournament.finalMatch);
    });
  }

  if (showChampionBtn) {
    showChampionBtn.addEventListener("click", () => {
      renderWorldCupSummaryScreen(true);
    });
  }
}

function startLiveFinalMatch(finalMatch) {
  startLiveMatch(finalMatch.homeTeam, finalMatch.awayTeam, handleFinalFinished);
}

function handleFinalFinished(match) {
  const champion = getLiveMatchWinner(match);

  app.innerHTML = `
    ${renderLiveMatch(match, gameState.selectedTeamId)}

    <section class="world-champion-box">
      <h2>Finale je završeno</h2>
      <h3>${match.homeTeam.ime} ${match.homeGoals} : ${match.awayGoals} ${match.awayTeam.ime}</h3>

      <h2>Šampion sveta</h2>
      <img src="${champion.slika}" alt="${champion.ime}">
      <h1>${champion.ime}</h1>

      <button id="restartGameBtn" class="next-match-btn">
        Vrati na početak / biraj ponovo svoj tim
      </button>
    </section>
  `;

  document.querySelector("#restartGameBtn").addEventListener("click", startGame);
}

function getLiveMatchWinner(match) {
  if (match.homeGoals > match.awayGoals) return match.homeTeam;
  if (match.awayGoals > match.homeGoals) return match.awayTeam;

  return Math.random() > 0.5 ? match.homeTeam : match.awayTeam;
}

function getRandomGoals() {
  return Math.floor(Math.random() * 5);
}

startGameBtn.addEventListener("click", startGame);