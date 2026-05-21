export function renderTeamSelect(teams) {
  return `
    <h2>Izaberi tim koji pratiš</h2>

    <div class="team-select-grid">
      ${teams
        .map(
          (team) => `
            <button 
              class="team-card" 
              data-team-id="${team.id}" 
              title="${team.ime}"
            >
              <img src="${team.slika}" alt="${team.ime}">
            </button>
          `
        )
        .join("")}
    </div>
  `;
}