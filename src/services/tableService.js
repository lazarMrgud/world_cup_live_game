export function createEmptyTeamStats(team) {
  return {
    ...team,
    tableStats: {
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0
    }
  };
}

export function calculateGroupTable(groupTeams, playedMatches) {
  const table = groupTeams.map(createEmptyTeamStats);

  playedMatches.forEach((match) => {
    const homeTeam = table.find((team) => team.id === match.homeTeam.id);
    const awayTeam = table.find((team) => team.id === match.awayTeam.id);

    if (!homeTeam || !awayTeam) return;

    updateTeamStats(homeTeam, match.homeGoals, match.awayGoals);
    updateTeamStats(awayTeam, match.awayGoals, match.homeGoals);
  });

  return sortGroupTable(table);
}

function updateTeamStats(team, goalsFor, goalsAgainst) {
  team.tableStats.played += 1;
  team.tableStats.goalsFor += goalsFor;
  team.tableStats.goalsAgainst += goalsAgainst;
  team.tableStats.goalDifference =
    team.tableStats.goalsFor - team.tableStats.goalsAgainst;

  if (goalsFor > goalsAgainst) {
    team.tableStats.wins += 1;
    team.tableStats.points += 3;
  } else if (goalsFor < goalsAgainst) {
    team.tableStats.losses += 1;
  } else {
    team.tableStats.draws += 1;
    team.tableStats.points += 1;
  }
}

export function sortGroupTable(table) {
  return [...table].sort((a, b) => {
    return (
      b.tableStats.points - a.tableStats.points ||
      b.tableStats.goalDifference - a.tableStats.goalDifference ||
      b.tableStats.goalsFor - a.tableStats.goalsFor
    );
  });
}

export function getQualifiedTeamsFromTable(table) {
  return table.slice(0, 2);
}