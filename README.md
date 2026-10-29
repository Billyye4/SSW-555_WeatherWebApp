# Weather Web App

SSW 555 Scrum group project: a weather forecast web app.

- Plain HTML, CSS, and JavaScript modules. No framework, no build step.
- Weather data from [Open-Meteo](https://open-meteo.com/). It's free and needs no API key.
- Backlog and sprint plan are in [docs/BACKLOG.md](docs/BACKLOG.md).

## Run locally

Requires [Node.js](https://nodejs.org/) 18 or newer.

```bash
npm start
```

Then open http://localhost:3000. You can't open `index.html` directly, because browsers block JS modules loaded from `file://`.

## Test

```bash
npm test
```

Tests use Node's built-in test runner. Put new tests next to the code, named `*.test.js`.

## Project layout

| File | Purpose |
|------|---------|
| `index.html` | Page markup |
| `style.css` | Styles |
| `app.js` | Page logic (events, rendering) |
| `weather.js` | API calls and helpers (no DOM, so it's testable) |
| `weather.test.js` | Tests for `weather.js` |

## Team workflow

1. Pick a story from the sprint backlog and move it to **In Progress** on the project board.
2. Branch from `main`: `git checkout -b US-04-forecast`.
3. Commit, push, and open a pull request that names the story (for example, "US-04: 7-day forecast").
4. Another team member reviews it. Merge after tests pass.

## Deploy

GitHub repo → **Settings → Pages** → Source: *Deploy from a branch*, `main`, `/ (root)`.
The site goes live at `https://billyye4.github.io/SSW-555_WeatherWebApp/`.
