import { createGroupSchedule } from "./scheduleService.js";
import {
  calculateGroupTable,
  getQualifiedTeamsFromTable
} from "./tableService.js";

export function simulateRestOfWorldCupGroups(groups, selectedGroupName, selectedGroupPlayedMatches) {
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

export function createKnockoutTournament(qualifiedTeams) {
  const roundOf16 = createKnockoutRound(qualifiedTeams, "Round of 16");
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