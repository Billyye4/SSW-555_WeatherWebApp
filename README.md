# Weather Web App

SSW 555 Scrum group project: a weather forecast web app.

- Choose Fahrenheit or Celsius for the displayed temperatures.
- Search for a city to see current conditions and hourly temperature and weather for the next 24 hours.
- Search for a city to see current conditions and a seven-day forecast.
- Plain HTML, CSS, and JavaScript modules. No framework, no build step.
- Weather data from [Open-Meteo](https://open-meteo.com/). It's free and needs no API key.
- Backlog and sprint plan are in [docs/BACKLOG.md](docs/BACKLOG.md).
- Classes, folder layout, and coding conventions are in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

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

One class per file, with its tests next to it. The full tree and conventions are in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#3-directory-structure).

| Path | Purpose |
|------|---------|
| `index.html` | Page markup: one `<section>` per view |
| `styles/` | Stylesheets |
| `src/main.js` | Entry point: creates every object and wires them together |
| `src/app/` | `App`, which owns the state and coordinates everything |
| `src/services/` | API calls (Open-Meteo, NWS). No DOM, so they're testable |
| `src/models/` | Data classes such as `Location` and `WeatherReport` |
| `src/storage/` | Saved preferences and favorites (`localStorage`) |
| `src/util/` | Pure helpers: units, dates, weather codes |
| `src/ui/` | Views that render into the page |
| `src/testing/` | Test helpers (fake API responses, fake storage) |
| `vendor/three/` | [three.js](https://threejs.org/) r187, unmodified, for the animated weather band (MIT license) |

## Team workflow

1. Pick a story from the sprint backlog and move it to **In Progress** on the project board.
2. Branch from `main`: `git checkout -b US-03-weekly-forecast`.
3. Commit, push, and open a pull request that names the story (for example, "US-03: weekly forecast").
4. Another team member reviews it. Merge after tests pass.

## Deploy

GitHub repo → **Settings → Pages** → Source: *Deploy from a branch*, `main`, `/ (root)`.
The site goes live at `https://billyye4.github.io/SSW-555_WeatherWebApp/`.
