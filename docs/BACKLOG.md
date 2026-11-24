# Product Backlog

Prioritized by the Product Owner. Effort points run 1–5; higher means more effort.
For where each story's code goes, see [ARCHITECTURE.md](ARCHITECTURE.md).

| ID | User story | Points | Sprint | Status |
|----|-----------|--------|--------|--------|
| US-01 | As a user, I want to see the current temperature in Fahrenheit or Celsius so that I know how hot or cold it is right now. | 1 | 1 | Done |
| US-02 | As a user, I want to see an hourly forecast so that I can plan activities throughout the day. | 2 | 2 | Done |
| US-03 | As a user, I want to see the weather forecast for the week so that I can plan ahead. | 2 | 2 | Done |
| US-04 | As a user, I want the app to show the weather where I am automatically, so that I don't have to search for it. | 3 | 1 | To do |
| US-05 | As a commuter, I want to search for the weather in a specific city so that I can check the conditions for upcoming travel destinations. | 3 | 1 | Done (scaffold) |
| US-06 | As a returning user, I want to have my favorite locations saved so that I can check the weather quickly. | 2 | 3 | Done |
| US-07 | As a commuter, I want to receive severe weather alerts for my saved locations so that I can stay safe during extreme conditions. | 5 | 3 | Done |
| US-08 | As a user, I want to see the wind speed and direction so I can decide whether I want to wear a long sleeve shirt and/or jacket. | 1 | 1 | Done |
| US-09 | As a user, I want predicted chance of rain for a specific date so that I can decide whether to book an indoor backup. | 3 | 2 | Done |
| US-10 | As a user, I want to see historical weather data for the previous week so that I can compare current trends to recent days. | 3 | 4 | Done |
| US-11 | As someone with allergies, I want to see a pollen index so that I can plan my day ahead of time. | 2 | 4 | To do |
| US-12 | As a user, I want to see local sunrise and sunset times so that I know how much daylight is left. | 1 | 2 | To do |
| US-13 | As a user, I want the application's background color to change dynamically based on the weather conditions so that the interface feels immersive. | 3 | 4 | To do |

Total: 31 points.

Saving preferences uses the browser's `localStorage` instead of user accounts, so no backend or login is needed.

## Sprint goals

Sprints are ordered so each one builds on the previous one, at about 8 points per sprint.

- **Sprint 1 (8 pts): Current weather, anywhere.** City search, °F/°C, wind, and automatic location (US-05, US-01, US-08, US-04).
- **Sprint 2 (8 pts): Plan ahead.** Hourly, weekly, rain chance for a date, and sunrise/sunset (US-02, US-03, US-09, US-12).
- **Sprint 3 (7 pts): Personalize and stay safe.** Favorites and severe weather alerts (US-06, US-07).
- **Sprint 4 (8 pts): Extras.** Last week's history, pollen index, and the dynamic background (US-10, US-11, US-13).

## Known limitations

- **US-07:** Official alerts come from the US National Weather Service, so they only cover US locations. Elsewhere the app flags dangerous forecast conditions instead. Alerts are only checked while the app is open.
- **US-09:** Rain chance is only available from today through 15 days ahead.
- **US-11:** Pollen data from Open-Meteo only covers Europe. Other locations show "not available".

## Definition of Done

- Code merged to `main` through a reviewed pull request
- `npm test` passes
- Works on desktop and phone widths
- Acceptance criteria checked by the Product Owner
