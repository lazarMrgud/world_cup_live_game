export function renderTeamSelect(teams) {
  return `
    <h2>Izaberi tim koji pratiš</h2>

    <div class="team-select-grid">
      ${teams
        .map(
          (team) => `
            <button class="team-card" data-team-id="${team.id}">
              <img src="${team.slika}" alt="${team.ime}">
              <h3>${team.ime}</h3>
            </button>
          `
        )
        .join("")}
    </div>
  `;
}