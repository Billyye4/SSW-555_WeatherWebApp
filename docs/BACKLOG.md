# Product Backlog

Prioritized by the Product Owner. Points use Fibonacci (1, 2, 3, 5, 8).
Priority: P1 = must have, P2 = should have, P3 = nice to have, P4 = polish.

| ID | User story | Priority | Points | Sprint | Status |
|----|-----------|----------|--------|--------|--------|
| US-01 | As a user, I want to search for a city by name so that I can see weather for places I care about. | P1 | 3 | 1 | Done (scaffold) |
| US-02 | As a user, I want to see current temperature, feels-like, humidity, wind, and conditions so that I know what it's like outside right now. | P1 | 3 | 1 | Done (scaffold) |
| US-03 | As a user, I want a clear message when a city isn't found or the service is down so that I know what went wrong. | P1 | 2 | 1 | Done (scaffold) |
| US-04 | As a user, I want a 7-day forecast so that I can plan my week. | P1 | 5 | 2 | To do |
| US-05 | As a user, I want to switch between °C and °F so that I see temperatures in the unit I understand. | P2 | 2 | 2 | To do |
| US-06 | As a user, I want to use my current location so that I don't have to type my city. | P2 | 3 | 2 | To do |
| US-07 | As a mobile user, I want the layout to fit my phone screen so that I can check the weather on the go. | P2 | 3 | 2 | To do |
| US-08 | As a team, we want the app deployed to a public URL so that stakeholders can try each increment. | P2 | 1 | 2 | To do |
| US-09 | As a user, I want an hourly forecast for the next 24 hours so that I can plan my day. | P3 | 5 | 3 | To do |
| US-10 | As a commuter, I want to see the chance of precipitation so that I know whether to bring an umbrella. | P3 | 2 | 3 | To do |
| US-11 | As a returning user, I want to save favorite cities so that I can check them with one click. | P3 | 5 | 3 | To do |
| US-12 | As a returning user, I want the app to remember my unit choice and last city so that I don't have to set them each visit. | P3 | 2 | 3 | To do |
| US-13 | As a user, I want to see my recent searches so that I can quickly revisit them. | P3 | 3 | 4 | To do |
| US-14 | As a user, I want to see sunrise, sunset, and UV index so that I can plan outdoor activities. | P4 | 2 | 4 | To do |
| US-15 | As a user who prefers dark screens, I want a dark mode so that the app is comfortable at night. | P4 | 2 | 4 | To do |
| US-16 | As a keyboard or screen-reader user, I want the app to be fully accessible so that I can use it without a mouse. | P4 | 3 | 4 | To do |

Saving preferences uses the browser's `localStorage` instead of user accounts, so no backend or login is needed.

## Sprint goals

- **Sprint 1:** Search for a city and see its current weather (US-01 to US-03).
- **Sprint 2:** Plan the week: 7-day forecast, units, location, mobile, deploy (US-04 to US-08).
- **Sprint 3:** Plan the day and personalize: hourly, rain chance, favorites, saved prefs (US-09 to US-12).
- **Sprint 4:** Polish: recent searches, sun/UV, dark mode, accessibility (US-13 to US-16).

## Definition of Done

- Code merged to `main` through a reviewed pull request
- `npm test` passes
- Works on desktop and phone widths
- Acceptance criteria checked by the Product Owner
