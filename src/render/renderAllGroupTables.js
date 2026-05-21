import { renderGroupTable } from "./renderGroupTable.js";

export function renderAllGroupTables(allGroupResults, selectedTeamId) {
  return `
    <section class="all-groups-box">
      <h2>Statistika svih grupa</h2>

      <div class="all-groups-grid">
        ${Object.entries(allGroupResults)
          .map(([groupName, group]) =>
            renderGroupTable(groupName, group.table, selectedTeamId)
          )
          .join("")}
      </div>
    </section>
  `;
}