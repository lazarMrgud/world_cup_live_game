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
  const A = allGroupResults["Group A"].qualifiedTeams;
  const B = allGroupResults["Group B"].qualifiedTeams;
  const C = allGroupResults["Group C"].qualifiedTeams;
  const D = allGroupResults["Group D"].qualifiedTeams;
  const E = allGroupResults["Group E"].qualifiedTeams;
  const F = allGroupResults["Group F"].qualifiedTeams;
  const G = allGroupResults["Group G"].qualifiedTeams;
  const H = allGroupResults["Group H"].qualifiedTeams;

  return [
    createKnockoutMatch(A[0], B[1], "Round of 16"),
    createKnockoutMatch(B[0], A[1], "Round of 16"),

    createKnockoutMatch(C[0], D[1], "Round of 16"),
    createKnockoutMatch(D[0], C[1], "Round of 16"),

    createKnockoutMatch(E[0], F[1], "Round of 16"),
    createKnockoutMatch(F[0], E[1], "Round of 16"),

    createKnockoutMatch(G[0], H[1], "Round of 16"),
    createKnockoutMatch(H[0], G[1], "Round of 16")
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