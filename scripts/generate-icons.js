// Generates the app icon set from a single vector definition.
//
// The mark is a pointed arch — a mihrab/doorway, since "manzil" is a dwelling
// or resting place — with a crescent above it and a threshold beneath. Colours
// come straight from the app's design tokens so the icon and the UI agree.
//
// Run: node scripts/generate-icons.js

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const OUT = path.join(__dirname, '..', 'assets');

const GOLD_LIGHT = '#E8CE97';
const GOLD = '#B08D4F';
const BG_TOP = '#352C24';
const BG_BOTTOM = '#1F1A16';

/**
 * The mark: a Taj-inspired silhouette — onion dome and finial over an iwan
 * arch, flanked by minarets. Simplified so it still reads at launcher size.
 */
function mark({ fill, scale = 1 }) {
  // Artwork spans y 232..812; nudge up so it sits optically centred.
  const shift = -10;
  const inner = `
    <g transform="translate(0 ${shift})">
      <!-- minarets -->
      <path fill="${fill}" d="
        M236,812 L236,506 Q236,462 264,440 Q292,462 292,506 L292,812 Z
        M732,812 L732,506 Q732,462 760,440 Q788,462 788,506 L788,812 Z
      "/>
      <circle cx="264" cy="424" r="13" fill="${fill}"/>
      <circle cx="760" cy="424" r="13" fill="${fill}"/>

      <!-- plinth and iwan: base block with a pointed arch cut out -->
      <path fill-rule="evenodd" fill="${fill}" d="
        M316,812 L316,596 L708,596 L708,812 Z
        M436,812 L436,706 Q436,632 512,602 Q588,632 588,706 L588,812 Z
      "/>

      <!-- chhatris flanking the main dome -->
      <path fill="${fill}" d="
        M326,596 C316,566 322,542 346,524 C354,518 358,513 360,508
          C362,513 366,518 374,524 C398,542 404,566 394,596 Z
        M630,596 C620,566 626,542 650,524 C658,518 662,513 664,508
          C666,513 670,518 678,524 C702,542 708,566 698,596 Z"/>
      <circle cx="360" cy="496" r="9" fill="${fill}"/>
      <circle cx="664" cy="496" r="9" fill="${fill}"/>

      <!-- drum -->
      <rect x="404" y="556" width="216" height="44" fill="${fill}"/>

      <!-- onion dome -->
      <path fill="${fill}" d="
        M404,556
        C388,505 396,450 442,405
        C472,372 496,352 512,332
        C528,352 552,372 582,405
        C628,450 636,505 620,556
        Z"/>

      <!-- finial -->
      <rect x="505" y="268" width="14" height="70" fill="${fill}"/>
      <circle cx="512" cy="258" r="17" fill="${fill}"/>
    </g>`;

  // Scale about the centre for the adaptive-icon safe zone.
  if (scale === 1) return inner;
  const t = 512 * (1 - scale);
  return `<g transform="translate(${t} ${t}) scale(${scale})">${inner}</g>`;
}

const defs = `
  <defs>
    <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${GOLD_LIGHT}"/>
      <stop offset="100%" stop-color="${GOLD}"/>
    </linearGradient>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${BG_TOP}"/>
      <stop offset="100%" stop-color="${BG_BOTTOM}"/>
    </linearGradient>
    <mask id="crescentMask">
      <rect width="1024" height="1024" fill="black"/>
      <circle cx="512" cy="578" r="80" fill="white"/>
      <circle cx="546" cy="558" r="68" fill="black"/>
    </mask>
  </defs>`;

const svg = (body, bg) => `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  ${defs}
  ${bg ? `<rect width="1024" height="1024" fill="${bg}"/>` : ''}
  ${body}
</svg>`;

const files = {
  // Full-bleed launcher icon (iOS + Android legacy).
  'icon.png': svg(mark({ fill: 'url(#gold)' }), 'url(#bg)'),

  // Android adaptive icon: separate layers, foreground kept inside the
  // 66% safe zone so system masks never clip it.
  'android-icon-background.png': svg('', 'url(#bg)'),
  'android-icon-foreground.png': svg(mark({ fill: 'url(#gold)', scale: 0.68 })),
  // Themed icons are tinted by the OS, so this one is a flat silhouette.
  'android-icon-monochrome.png': svg(mark({ fill: '#000000', scale: 0.68 })),

  'splash-icon.png': svg(mark({ fill: 'url(#gold)', scale: 0.82 })),
  'favicon.png': svg(mark({ fill: 'url(#gold)' }), 'url(#bg)'),
};

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  for (const [name, source] of Object.entries(files)) {
    const size = name === 'favicon.png' ? 196 : 1024;
    await sharp(Buffer.from(source)).resize(size, size).png().toFile(path.join(OUT, name));
    console.log(`wrote ${name} (${size}x${size})`);
  }

  // A standalone preview so the mark can be eyeballed at real launcher size.
  await sharp(Buffer.from(files['icon.png']))
    .resize(192, 192)
    .png()
    .toFile(path.join(OUT, 'icon-preview-192.png'));
  console.log('wrote icon-preview-192.png');
})();
