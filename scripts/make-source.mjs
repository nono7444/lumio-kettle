// Source AltStore / FlareStore / SideStore pour la dernière build de Lumio Kettle.
// Usage : node scripts/make-source.mjs <version> <tag> <ipa>
import { statSync, writeFileSync } from 'node:fs';

const [version, tag, ipa = 'lumio-kettle-unsigned.ipa'] = process.argv.slice(2);
const repo = process.env.GITHUB_REPOSITORY || 'nono7444/lumio-kettle';
const size = statSync(ipa).size;
const date = new Date().toISOString();
const downloadURL = `https://github.com/${repo}/releases/download/${tag}/${ipa}`;
const iconURL = `https://raw.githubusercontent.com/${repo}/main/resources/icon.png`;

const app = {
  name: 'Lumio Kettle',
  bundleIdentifier: 'lol.wawanono.lumiokettle',
  developerName: 'Norman',
  subtitle: 'Kettlebell · 12 semaines',
  localizedDescription: 'Programme kettlebell progressif de 12 semaines, 2 séances de 40 min, avec chrono, voix, bips et vidéos.',
  iconURL,
  tintColor: '#FF7A1A',
  category: 'utilities',
  version,
  versionDate: date,
  downloadURL,
  size,
  versions: [{ version, buildVersion: version.split('.').pop(), date, size, downloadURL, minOSVersion: '15.0', localizedDescription: `Build ${tag}` }],
  appPermissions: { entitlements: [], privacy: {} },
};

writeFileSync('altstore.json', JSON.stringify({
  name: 'Lumio Kettle',
  identifier: 'lol.wawanono.lumiokettle.source',
  sourceURL: `https://github.com/${repo}/releases/latest/download/altstore.json`,
  subtitle: 'Kettlebell · 12 semaines',
  iconURL,
  tintColor: '#FF7A1A',
  apps: [app],
  news: [],
}, null, 2));
console.log(`altstore.json : Lumio Kettle ${version} → ${downloadURL} (${size} octets)`);
