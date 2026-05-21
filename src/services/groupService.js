import { shuffleArray } from "../utils/random.js";

const GROUP_NAMES = [
  "Group A",
  "Group B",
  "Group C",
  "Group D",
  "Group E",
  "Group F",
  "Group G",
  "Group H"
];

export function createRandomGroups(teams) {
  const shuffledTeams = shuffleArray(teams);

  return shuffledTeams.reduce((groups, team, index) => {
    const groupName = GROUP_NAMES[Math.floor(index / 4)];

    if (!groups[groupName]) {
      groups[groupName] = [];
    }

    groups[groupName].push({
      ...team,
      grupa: groupName,
      info: {
        P: 0,
        W: 0,
        D: 0,
        L: 0,
        GF: 0,
        GA: 0,
        GD: 0,
        Pts: 0
      }
    });

    return groups;
  }, {});
}

export function findTeamGroup(groups, selectedTeamId) {
  return Object.entries(groups).find(([groupName, groupTeams]) => {
    return groupTeams.some(
      (team) => String(team.id) === String(selectedTeamId)
    );
  });
}