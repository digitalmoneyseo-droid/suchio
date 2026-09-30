// Refresh the checked-in font files and CSS after updating @fontsource-variable/dm-sans.
const source = 'node_modules/@fontsource-variable/dm-sans';
for (const subset of ['latin', 'latin-ext']) {
  const file = 'dm-sans-' + subset + '-standard-normal.woff2';
  await Bun.write('public/fonts/' + file, Bun.file(source + '/files/' + file));
}
await Bun.write('public/fonts/OFL.txt', Bun.file(source + '/LICENSE'));
const css = (await Bun.file(source + '/standard.css').text())
  .replaceAll('font-display: swap', 'font-display: optional')
  .replaceAll('url(./files/', 'url(/fonts/');
await Bun.write('src/styles/fonts.css', css);
console.log('Updated DM Sans subsets, license, and optional-display CSS.');

const monoSource = 'node_modules/@fontsource/jetbrains-mono';
let monoCss = '';
for (const weight of [400, 500]) {
  monoCss += (await Bun.file(`${monoSource}/latin-${weight}.css`).text()).replaceAll('url(./files/', 'url(/fonts/');
  for (const extension of ['woff2', 'woff']) {
    const file = `jetbrains-mono-latin-${weight}-normal.${extension}`;
    await Bun.write(`public/fonts/${file}`, Bun.file(`${monoSource}/files/${file}`));
  }
}
await Bun.write('public/fonts/jetbrains-mono-OFL.txt', Bun.file(`${monoSource}/LICENSE`));
await Bun.write('src/styles/mono-fonts.css', monoCss);
console.log('Updated JetBrains Mono files, license, and absolute font URLs.');
