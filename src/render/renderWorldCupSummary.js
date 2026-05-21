import { renderAllGroupTables } from "./renderAllGroupTables.js";

export function renderWorldCupSummary({
  allGroupResults,
  knockoutTournament,
  selectedTeamId,
  showChampion = false
}) {
  return `
    <section class="world-cup-summary">
      <h2>Svetsko prvenstvo - završnica</h2>

      ${renderSelectedTeamStatus(
        allGroupResults,
        knockoutTournament,
        selectedTeamId,
        showChampion
      )}

      ${renderAllGroupTables(allGroupResults, selectedTeamId)}

      <h3>Timovi koji su prošli iz grupa</h3>
      ${renderQualifiedTeams(allGroupResults)}

      <h3>Round of 16</h3>
      ${renderKnockoutRound(knockoutTournament.roundOf16, selectedTeamId)}

      <h3>Quarter final</h3>
      ${renderKnockoutRound(knockoutTournament.quarterFinal, selectedTeamId)}

      <h3>Semi final</h3>
      ${renderKnockoutRound(knockoutTournament.semiFinal, selectedTeamId)}

      <section class="final-choice-box">
        <h2>Finale Svetskog prvenstva</h2>
        ${renderFinalPreview(knockoutTournament.finalMatch, selectedTeamId, showChampion)}

        ${
          showChampion
            ? renderChampion(knockoutTournament.champion)
            : `
              <p>Finale je spremno. Da li želiš da gledaš finale uživo ili da odmah vidiš pobednika?</p>

              <button id="watchFinalBtn" class="next-match-btn">
                Gledaj finale uživo
              </button>

              <button id="showChampionBtn" class="next-match-btn secondary-btn">
                Prikaži pobednika odmah
              </button>
            `
        }
      </section>

      <button id="restartGameBtn" class="next-match-btn">
        Vrati na početak / biraj ponovo svoj tim
      </button>
    </section>
  `;
}

function renderSelectedTeamStatus(
  allGroupResults,
  knockoutTournament,
  selectedTeamId,
  showChampion
) {
  const qualifiedTeams = Object.values(allGroupResults)
    .flatMap((group) => group.qualifiedTeams);

  const selectedQualified = qualifiedTeams.some(
    (team) => String(team.id) === String(selectedTeamId)
  );

  const championIsSelected =
    String(knockoutTournament.champion.id) === String(selectedTeamId);

  if (showChampion && championIsSelected) {
    return `<div class="selected-status success">Tvoj tim je osvojio Svetsko prvenstvo!</div>`;
  }

  if (selectedQualified) {
    return `<div class="selected-status success">Tvoj tim je prošao grupu. Turnir se nastavlja do finala.</div>`;
  }

  return `<div class="selected-status fail">Tvoj tim je ispao u grupi, ali možeš da pratiš završnicu i finale.</div>`;
}

function renderQualifiedTeams(allGroupResults) {
  return `
    <div class="qualified-structure">
      ${Object.entries(allGroupResults)
        .map(
          ([groupName, group]) => `
            <div class="qualified-group-card">
              <h4>${groupName}</h4>
              ${group.qualifiedTeams
                .map(
                  (team) => `
                    <div class="qualified-small-team">
                      <img src="${team.slika}" alt="${team.ime}">
                      <span>${team.ime}</span>
                    </div>
                  `
                )
                .join("")}
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function renderKnockoutRound(matches, selectedTeamId) {
  return `
    <div class="knockout-round-list">
      ${matches
        .map((match) => renderKnockoutMatch(match, selectedTeamId))
        .join("")}
    </div>
  `;
}

function renderFinalPreview(match, selectedTeamId, showChampion) {
  return `
    <div class="knockout-round-list">
      ${renderFinalMatch(match, selectedTeamId, showChampion)}
    </div>
  `;
}
function renderFinalMatch(match, selectedTeamId, showChampion) {
  const selectedMatch =
    String(match.homeTeam.id) === String(selectedTeamId) ||
    String(match.awayTeam.id) === String(selectedTeamId);

  if (!showChampion) {
    return `
      <div class="knockout-card ${selectedMatch ? "selected-knockout-card" : ""}">
        <strong>World Cup Final</strong>
        <p>
          ${match.homeTeam.ime}
          vs
          ${match.awayTeam.ime}
        </p>
        <p>Finale još nije odigrano.</p>
      </div>
    `;
  }

  const penalties =
    match.homePenalties !== null
      ? `<p>Penali: ${match.homePenalties} - ${match.awayPenalties}</p>`
      : "";

  return `
    <div class="knockout-card ${selectedMatch ? "selected-knockout-card" : ""}">
      <strong>${match.round}</strong>
      <p>
        ${match.homeTeam.ime}
        ${match.homeGoals} : ${match.awayGoals}
        ${match.awayTeam.ime}
      </p>
      ${penalties}
      <p>Pobednik: <strong>${match.winner.ime}</strong></p>
    </div>
  `;
}

function renderKnockoutMatch(match, selectedTeamId) {
  const selectedMatch =
    String(match.homeTeam.id) === String(selectedTeamId) ||
    String(match.awayTeam.id) === String(selectedTeamId);

  const penalties =
    match.homePenalties !== null
      ? `<p>Penali: ${match.homePenalties} - ${match.awayPenalties}</p>`
      : "";

  return `
    <div class="knockout-card ${selectedMatch ? "selected-knockout-card" : ""}">
      <strong>${match.round}</strong>
      <p>
        ${match.homeTeam.ime}
        ${match.homeGoals} : ${match.awayGoals}
        ${match.awayTeam.ime}
      </p>
      ${penalties}
      <p>Pobednik: <strong>${match.winner.ime}</strong></p>
    </div>
  `;
}

function renderChampion(champion) {
  return `
    <div class="world-champion-box">
      <h2>Šampion sveta</h2>
      <img src="${champion.slika}" alt="${champion.ime}">
      <h1>${champion.ime}</h1>
    </div>
  `;
}