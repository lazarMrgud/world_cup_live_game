export function renderWorldCupSummary({
  allGroupResults,
  knockoutTournament,
  selectedTeamId
}) {
  return `
    <section class="world-cup-summary">
      <h2>Svetsko prvenstvo - završnica</h2>

      ${renderSelectedTeamStatus(
        allGroupResults,
        knockoutTournament,
        selectedTeamId
      )}

      <h3>Timovi koji su prošli iz grupa</h3>
      ${renderQualifiedTeams(allGroupResults)}

      <h3>Round of 16</h3>
      ${renderKnockoutRound(knockoutTournament.roundOf16, selectedTeamId)}

      <h3>Quarter final</h3>
      ${renderKnockoutRound(knockoutTournament.quarterFinal, selectedTeamId)}

      <h3>Semi final</h3>
      ${renderKnockoutRound(knockoutTournament.semiFinal, selectedTeamId)}

      <h3>Finale Svetskog prvenstva</h3>
      ${renderKnockoutRound([knockoutTournament.finalMatch], selectedTeamId)}

      <div class="world-champion-box">
        <h2>Šampion sveta</h2>
        <img src="${knockoutTournament.champion.slika}" alt="${knockoutTournament.champion.ime}">
        <h1>${knockoutTournament.champion.ime}</h1>
      </div>

      <button id="watchFinalBtn" class="next-match-btn">
        Gledaj finale uživo
      </button>

      <button id="restartGameBtn" class="next-match-btn">
        Pokreni novo Svetsko prvenstvo
      </button>
    </section>
  `;
}

function renderSelectedTeamStatus(allGroupResults, knockoutTournament, selectedTeamId) {
  const qualifiedTeams = Object.values(allGroupResults)
    .flatMap((group) => group.qualifiedTeams);

  const selectedQualified = qualifiedTeams.some(
    (team) => String(team.id) === String(selectedTeamId)
  );

  const championIsSelected =
    String(knockoutTournament.champion.id) === String(selectedTeamId);

  if (championIsSelected) {
    return `<div class="selected-status success">Tvoj tim je osvojio Svetsko prvenstvo!</div>`;
  }

  if (selectedQualified) {
    return `<div class="selected-status success">Tvoj tim je prošao grupu, ali nije osvojio turnir.</div>`;
  }

  return `<div class="selected-status fail">Tvoj tim je ispao u grupi, ali turnir se nastavio do finala.</div>`;
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
        .map(
          (match) => {
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
        )
        .join("")}
    </div>
  `;
}