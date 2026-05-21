export function renderLiveMatch(match, selectedTeamId) {
  const selectedTeamIsPlaying =
    String(match.homeTeam.id) === String(selectedTeamId) ||
    String(match.awayTeam.id) === String(selectedTeamId);

  return `
    <section class="live-match ${selectedTeamIsPlaying ? "selected-team-match" : ""}">
      <div class="scoreboard">
        <div class="live-team">
          <img src="${match.homeTeam.slika}" alt="${match.homeTeam.ime}">
          <h3>${match.homeTeam.ime}</h3>
        </div>

        <div class="live-score">
          <strong>${match.homeGoals}</strong>
          <span>:</span>
          <strong>${match.awayGoals}</strong>
          <p>${match.minute}'</p>
        </div>

        <div class="live-team">
          <img src="${match.awayTeam.slika}" alt="${match.awayTeam.ime}">
          <h3>${match.awayTeam.ime}</h3>
        </div>
      </div>

      <div class="football-field">
        <div class="goal goal-left"></div>
        <div class="center-line"></div>
        <div class="center-circle"></div>

        <div class="ball" style="left: ${match.ballPosition}%">⚽</div>

        <div class="goal goal-right"></div>
      </div>

      <div class="match-info-layout">
        ${renderEvents(match)}
        ${renderStats(match)}
      </div>
    </section>
  `;
}

function renderEvents(match) {
  const latestEvents = match.events.slice(-8).reverse();

  return `
    <div class="match-events">
      <h3>Dešavanja</h3>

      ${latestEvents
        .map(
          (event) => `
            <p class="event event-${event.type}">
              <strong>${event.minute}'</strong> ${event.message}
            </p>
          `
        )
        .join("")}
    </div>
  `;
}

function renderStats(match) {
  return `
    <div class="match-stats">
      <h3>Statistika</h3>

      <div class="stat-row">
        <span>${match.stats.home.shots}</span>
        <strong>Šutevi</strong>
        <span>${match.stats.away.shots}</span>
      </div>

      <div class="stat-row">
        <span>${match.stats.home.shotsOnTarget}</span>
        <strong>Šutevi u okvir</strong>
        <span>${match.stats.away.shotsOnTarget}</span>
      </div>

      <div class="stat-row">
        <span>${match.stats.home.fouls}</span>
        <strong>Faulovi</strong>
        <span>${match.stats.away.fouls}</span>
      </div>

      <div class="stat-row">
        <span>${match.stats.home.yellowCards}</span>
        <strong>Žuti kartoni</strong>
        <span>${match.stats.away.yellowCards}</span>
      </div>

      <div class="stat-row">
        <span>${match.stats.home.substitutions}</span>
        <strong>Izmene</strong>
        <span>${match.stats.away.substitutions}</span>
      </div>

      <div class="stat-row">
        <span>${match.stats.home.possession}%</span>
        <strong>Posed</strong>
        <span>${match.stats.away.possession}%</span>
      </div>
    </div>
  `;
}