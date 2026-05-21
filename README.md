# World Cup Live Game

World Cup Live Game is a football tournament simulation built with HTML, CSS and JavaScript.

The user can choose a national team, follow live match simulations, watch the ball move across the pitch, track match statistics, and continue the tournament from the group stage to the World Cup final.

## Features

- Choose a team to follow
- Random group generation
- Group stage simulation
- Live match view
- Animated football pitch
- Ball movement during the match
- Match events:
  - goals
  - fouls
  - yellow cards
  - substitutions
  - shots
  - saves
- Match statistics
- Group tables
- Qualified teams
- Knockout phase
- World Cup final
- Option to watch the final live
- Restart and choose another team

## Technologies

- HTML5
- CSS3
- JavaScript ES Modules
- Git
- GitHub
- Netlify

## Project Structure

```text
src/
├── data/
│   └── teams.js
├── render/
│   ├── renderTeamSelect.js
│   ├── renderLiveMatch.js
│   ├── renderGroupTable.js
│   └── renderWorldCupSummary.js
├── services/
│   ├── groupService.js
│   ├── scheduleService.js
│   ├── tableService.js
│   ├── liveMatchService.js
│   └── worldCupService.js
├── state/
│   └── gameState.js
├── utils/
│   └── random.js
└── main.js