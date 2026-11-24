// Weather icons as inline SVG on a 64×64 grid. The markup is built only from the constants
// below, never from API or user data, so it is safe to set with innerHTML.

const SUN = '#ffc83d';
const MOON = '#f3efd2';
const CLOUD = '#f2f6fb';
const CLOUD_BACK = '#b9c6d6';
const STORM_CLOUD = '#8f9bb0';
const RAIN = '#7cc2ff';
const BOLT = '#ffd23f';

// A cloud whose flat base runs from x=18 to x=46 at y=48.
const CLOUD_PATH = 'M18 48h28a10 10 0 0 0 1.5-19.9A14 14 0 0 0 20.6 25.3 11.5 11.5 0 0 0 18 48z';

// A sun disc of radius r with 8 short rays around it.
function sun(cx, cy, r) {
  const rays = Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4;
    const at = (d) => [round(cx + Math.cos(a) * d), round(cy + Math.sin(a) * d)];
    const [[x1, y1], [x2, y2]] = [at(r + 4), at(r + 9)];
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
  }).join('');
  return `<g class="wx-sun" stroke="${SUN}" stroke-width="3.5" stroke-linecap="round">${rays}</g>`
    + `<circle class="wx-sun" cx="${cx}" cy="${cy}" r="${r}" fill="${SUN}"/>`;
}

// A crescent: the circle (30,32) r15 with the circle (37,26) r12 cut out, joined where they cross.
function moon(dx = 0, dy = 0, scale = 1) {
  return `<path class="wx-moon" transform="translate(${dx} ${dy}) scale(${scale})" fill="${MOON}" `
    + 'd="M44.6 35.3A15 15 0 1 1 29 17a12 12 0 0 0 15.6 18.3z"/>';
}

function cloud(dx = 0, dy = 0, scale = 1, fill = CLOUD) {
  const part = { [CLOUD]: 'wx-cloud', [CLOUD_BACK]: 'wx-cloud-back', [STORM_CLOUD]: 'wx-storm-cloud' }[fill];
  return `<path class="${part}" transform="translate(${dx} ${dy}) scale(${scale})" fill="${fill}" d="${CLOUD_PATH}"/>`;
}

function round(n) {
  return Math.round(n * 10) / 10;
}

const lines = (part, color, width, segments) =>
  `<g class="${part}" stroke="${color}" stroke-width="${width}" stroke-linecap="round">${
    segments.map(([x1, y1, x2, y2]) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`).join('')}</g>`;

const BODIES = {
  clear: (day) => (day ? sun(32, 32, 11) : moon()),
  'mostly-clear': (day) => (day ? sun(28, 28, 10) : moon(-4, -4)) + cloud(14, 14, 0.75),
  'partly-cloudy': (day) => (day ? sun(24, 22, 9) : moon(-8, -10, 0.85)) + cloud(6, 4, 0.95),
  overcast: () => cloud(8, -6, 0.85, CLOUD_BACK) + cloud(-2, 2),
  fog: () => cloud(0, -8) + lines('wx-fog', CLOUD, 3.5, [[14, 48, 50, 48], [20, 56, 44, 56]]),
  drizzle: () => cloud(0, -8) + lines('wx-rain', RAIN, 3, [[24, 47, 23, 51], [33, 47, 32, 51], [42, 47, 41, 51], [28, 55, 27, 59], [38, 55, 37, 59]]),
  rain: () => cloud(0, -8) + lines('wx-rain', RAIN, 3.5, [[24, 46, 20, 56], [33, 46, 29, 56], [42, 46, 38, 56]]),
  snow: () => cloud(0, -8) + [[23, 50], [32, 54], [41, 50], [27, 58], [37, 58]]
    .map(([x, y]) => `<circle class="wx-snow" cx="${x}" cy="${y}" r="2.6" fill="${CLOUD}"/>`).join(''),
  storm: () => cloud(0, -8, 1, STORM_CLOUD) + `<path class="wx-bolt" fill="${BOLT}" d="M34 40l-8 12h6l-3 10 11-14h-6l4-8z"/>`,
};

const KINDS = {
  0: 'clear',
  1: 'mostly-clear',
  2: 'partly-cloudy',
  3: 'overcast',
  45: 'fog', 48: 'fog',
  51: 'drizzle', 53: 'drizzle', 55: 'drizzle', 56: 'drizzle', 57: 'drizzle',
  61: 'rain', 63: 'rain', 65: 'rain', 66: 'rain', 67: 'rain', 80: 'rain', 81: 'rain', 82: 'rain',
  71: 'snow', 73: 'snow', 75: 'snow', 77: 'snow', 85: 'snow', 86: 'snow',
  95: 'storm', 96: 'storm', 99: 'storm',
};

export class Icons {
  // The icon family for a WMO weather code. Unknown codes draw as overcast.
  static kindFor(code) {
    return KINDS[code] ?? 'overcast';
  }

  // Inline SVG for a weather code. At night, clear and partly cloudy skies show the moon.
  static svg(code, isDay = true) {
    return `<svg viewBox="0 0 64 64" class="weather-icon" aria-hidden="true" focusable="false">${
      BODIES[Icons.kindFor(code)](isDay)}</svg>`;
  }
}
