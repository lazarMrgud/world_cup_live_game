export function renderGroupTable(groupName, table, selectedTeamId) {
  return `
    <section class="group-table-box">
      <h2>${groupName} tabela</h2>

      <table class="group-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Tim</th>
            <th>P</th>
            <th>W</th>
            <th>D</th>
            <th>L</th>
            <th>GF</th>
            <th>GA</th>
            <th>GD</th>
            <th>Pts</th>
          </tr>
        </thead>

        <tbody>
          ${table
            .map(
              (team, index) => `
                <tr class="${String(team.id) === String(selectedTeamId) ? "selected-table-team" : ""}">
                  <td>${index + 1}</td>
                  <td>
                    <img src="${team.slika}" alt="${team.ime}">
                    ${team.ime}
                  </td>
                  <td>${team.tableStats.played}</td>
                  <td>${team.tableStats.wins}</td>
                  <td>${team.tableStats.draws}</td>
                  <td>${team.tableStats.losses}</td>
                  <td>${team.tableStats.goalsFor}</td>
                  <td>${team.tableStats.goalsAgainst}</td>
                  <td>${team.tableStats.goalDifference}</td>
                  <td><strong>${team.tableStats.points}</strong></td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    </section>
  `;
}