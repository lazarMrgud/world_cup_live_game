import { createGroupSchedule } from "./scheduleService.js";
import {
  calculateGroupTable,
  getQualifiedTeamsFromTable
} from "./tableService.js";

export function simulateRestOfWorldCupGroups(
  groups,
  selectedGroupName,
  selectedGroupPlayedMatches
) {
  const allGroupResults = {};
  const allQualifiedTeams = [];

  Object.entries(groups).forEach(([groupName, groupTeams]) => {
    let playedMatches = [];

    if (groupName === selectedGroupName) {
      playedMatches = selectedGroupPlayedMatches;
    } else {
      const schedule = createGroupSchedule(groupName, groupTeams);

      playedMatches = schedule.map((match) => {
        const homeGoals = getRandomGoals();
        const awayGoals = getRandomGoals();

        return {
          ...match,
          homeGoals,
          awayGoals
        };
      });
    }

    const table = calculateGroupTable(groupTeams, playedMatches);
    const qualifiedTeams = getQualifiedTeamsFromTable(table);

    allGroupResults[groupName] = {
      table,
      playedMatches,
      qualifiedTeams
    };

    allQualifiedTeams.push(...qualifiedTeams);
  });

  return {
    allGroupResults,
    allQualifiedTeams
  };
}

export function createKnockoutTournamentFromGroups(allGroupResults) {
  const roundOf16 = createRoundOf16FromGroups(allGroupResults);

  if (roundOf16.length !== 8) {
    throw new Error("Round of 16 nije pravilno napravljen.");
  }

  const quarterFinal = createKnockoutRound(
    roundOf16.map((match) => match.winner),
    "Quarter final"
  );

  const semiFinal = createKnockoutRound(
    quarterFinal.map((match) => match.winner),
    "Semi final"
  );

  const final = createKnockoutRound(
    semiFinal.map((match) => match.winner),
    "World Cup Final"
  );

  return {
    roundOf16,
    quarterFinal,
    semiFinal,
    finalMatch: final[0],
    champion: final[0].winner
  };
}

function createRoundOf16FromGroups(allGroupResults) {
  const groupA = allGroupResults["Group A"]?.qualifiedTeams || [];
  const groupB = allGroupResults["Group B"]?.qualifiedTeams || [];
  const groupC = allGroupResults["Group C"]?.qualifiedTeams || [];
  const groupD = allGroupResults["Group D"]?.qualifiedTeams || [];
  const groupE = allGroupResults["Group E"]?.qualifiedTeams || [];
  const groupF = allGroupResults["Group F"]?.qualifiedTeams || [];
  const groupG = allGroupResults["Group G"]?.qualifiedTeams || [];
  const groupH = allGroupResults["Group H"]?.qualifiedTeams || [];

  const requiredGroups = [
    groupA,
    groupB,
    groupC,
    groupD,
    groupE,
    groupF,
    groupG,
    groupH
  ];

  const allGroupsAreReady = requiredGroups.every(
    (group) => group.length >= 2
  );

  if (!allGroupsAreReady) {
    console.error("Nisu sve grupe spremne za Round of 16.", allGroupResults);
    return [];
  }

  return [
    createKnockoutMatch(groupA[0], groupB[1], "Round of 16"),
    createKnockoutMatch(groupB[0], groupA[1], "Round of 16"),

    createKnockoutMatch(groupC[0], groupD[1], "Round of 16"),
    createKnockoutMatch(groupD[0], groupC[1], "Round of 16"),

    createKnockoutMatch(groupE[0], groupF[1], "Round of 16"),
    createKnockoutMatch(groupF[0], groupE[1], "Round of 16"),

    createKnockoutMatch(groupG[0], groupH[1], "Round of 16"),
    createKnockoutMatch(groupH[0], groupG[1], "Round of 16")
  ];
}

function createKnockoutRound(teams, roundName) {
  const matches = [];

  for (let i = 0; i < teams.length; i += 2) {
    matches.push(createKnockoutMatch(teams[i], teams[i + 1], roundName));
  }

  return matches;
}

function createKnockoutMatch(homeTeam, awayTeam, roundName) {
  let homeGoals = getRandomGoals();
  let awayGoals = getRandomGoals();

  let homePenalties = null;
  let awayPenalties = null;

  if (homeGoals === awayGoals) {
    homePenalties = getRandomPenalties();
    awayPenalties = getRandomPenalties();

    while (homePenalties === awayPenalties) {
      awayPenalties = getRandomPenalties();
    }
  }

  const winner =
    homeGoals > awayGoals ||
    (homeGoals === awayGoals && homePenalties > awayPenalties)
      ? homeTeam
      : awayTeam;

  return {
    round: roundName,
    homeTeam,
    awayTeam,
    homeGoals,
    awayGoals,
    homePenalties,
    awayPenalties,
    winner
  };
}

function getRandomGoals() {
  return Math.floor(Math.random() * 5);
}

function getRandomPenalties() {
  return Math.floor(Math.random() * 4) + 2;
}