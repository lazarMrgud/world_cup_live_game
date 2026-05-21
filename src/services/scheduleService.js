export function createGroupSchedule(groupName, teams) {
  if (teams.length !== 4) {
    return [];
  }

  const [team1, team2, team3, team4] = teams;

  return [
    {
      round: 1,
      group: groupName,
      homeTeam: team1,
      awayTeam: team2
    },
    {
      round: 1,
      group: groupName,
      homeTeam: team3,
      awayTeam: team4
    },
    {
      round: 2,
      group: groupName,
      homeTeam: team1,
      awayTeam: team3
    },
    {
      round: 2,
      group: groupName,
      homeTeam: team2,
      awayTeam: team4
    },
    {
      round: 3,
      group: groupName,
      homeTeam: team1,
      awayTeam: team4
    },
    {
      round: 3,
      group: groupName,
      homeTeam: team2,
      awayTeam: team3
    }
  ];
}