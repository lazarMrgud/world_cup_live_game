import { getRandomNumber } from "../utils/random.js";

export function createLiveMatch(homeTeam, awayTeam) {
  return {
    homeTeam,
    awayTeam,
    minute: 0,
    homeGoals: 0,
    awayGoals: 0,
    ballPosition: 50,
    events: [],
    stats: {
      home: {
        shots: 0,
        shotsOnTarget: 0,
        fouls: 0,
        yellowCards: 0,
        substitutions: 0,
        possession: 50
      },
      away: {
        shots: 0,
        shotsOnTarget: 0,
        fouls: 0,
        yellowCards: 0,
        substitutions: 0,
        possession: 50
      }
    },
    isFinished: false
  };
}

export function playMinute(match) {
  if (match.minute >= 90) {
    match.isFinished = true;
    addEvent(match, "end", "Kraj utakmice");
    return match;
  }

  match.minute += 1;
  moveBall(match);

  const chance = Math.random();

  if (match.minute === 45) {
    addEvent(match, "half-time", "Poluvreme");
    return match;
  }

  if (chance < 0.08) {
    createAttack(match);
  } else if (chance < 0.14) {
    createShot(match);
  } else if (chance < 0.19) {
    createFoul(match);
  } else if (chance < 0.21) {
    createYellowCard(match);
  } else if (chance < 0.23 && match.minute > 55) {
    createSubstitution(match);
  }

  updatePossession(match);
  return match;
}

function moveBall(match) {
  const movement = getRandomNumber(-15, 15);
  match.ballPosition += movement;

  if (match.ballPosition < 5) match.ballPosition = 5;
  if (match.ballPosition > 95) match.ballPosition = 95;
}

function getRandomSide() {
  return Math.random() > 0.5 ? "home" : "away";
}

function getTeamBySide(match, side) {
  return side === "home" ? match.homeTeam : match.awayTeam;
}

function createAttack(match) {
  const side = getRandomSide();
  const team = getTeamBySide(match, side);

  match.ballPosition = side === "home" ? getRandomNumber(55, 80) : getRandomNumber(20, 45);

  addEvent(match, "attack", `${team.ime} kreće u napad`);
}

function createShot(match) {
  const side = getRandomSide();
  const team = getTeamBySide(match, side);

  match.stats[side].shots += 1;

  const isOnTarget = Math.random() < 0.55;
  const isGoal = Math.random() < 0.28;

  if (isOnTarget) {
    match.stats[side].shotsOnTarget += 1;
  }

  if (isGoal && isOnTarget) {
    if (side === "home") {
      match.homeGoals += 1;
      match.ballPosition = 95;
    } else {
      match.awayGoals += 1;
      match.ballPosition = 5;
    }

    addEvent(match, "goal", `GOOOL! ${team.ime} postiže gol`);
  } else if (isOnTarget) {
    addEvent(match, "save", `${team.ime} šutira, golman brani`);
  } else {
    addEvent(match, "miss", `${team.ime} šutira pored gola`);
  }
}

function createFoul(match) {
  const side = getRandomSide();
  const team = getTeamBySide(match, side);

  match.stats[side].fouls += 1;

  addEvent(match, "foul", `Faul pravi ${team.ime}`);
}

function createYellowCard(match) {
  const side = getRandomSide();
  const team = getTeamBySide(match, side);

  match.stats[side].yellowCards += 1;

  addEvent(match, "yellow-card", `Žuti karton za ${team.ime}`);
}

function createSubstitution(match) {
  const side = getRandomSide();
  const team = getTeamBySide(match, side);

  if (match.stats[side].substitutions >= 5) return;

  match.stats[side].substitutions += 1;

  addEvent(match, "substitution", `Izmena u timu ${team.ime}`);
}

function updatePossession(match) {
  const homePossession = getRandomNumber(40, 60);

  match.stats.home.possession = homePossession;
  match.stats.away.possession = 100 - homePossession;
}

function addEvent(match, type, message) {
  match.events.push({
    minute: match.minute,
    type,
    message
  });
}