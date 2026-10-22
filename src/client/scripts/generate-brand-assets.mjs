import { readFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

// Rasterize the repository's own vector icon for native launcher assets.
const source = readFileSync('public/help-icon.svg', 'utf8');
const browser = await chromium.launch({ channel: 'chrome' });
try {
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  const render = async (size, path, padding = 0) => {
    await page.setViewportSize({ width: size, height: size });
    const data = Buffer.from(source).toString('base64');
    await page.setContent(
      `<style>body{margin:0;background:#fffdf4;display:grid;place-items:center;width:100vw;height:100vh}img{width:${100 - padding * 2}vw;height:${100 - padding * 2}vh}</style><img src="data:image/svg+xml;base64,${data}">`,
    );
    await page.locator('img').evaluate((image) => image.decode());
    await page.screenshot({ path });
  };
  for (const [density, size] of [
    ['mdpi', 48],
    ['hdpi', 72],
    ['xhdpi', 96],
    ['xxhdpi', 144],
    ['xxxhdpi', 192],
  ]) {
    const directory = `android/app/src/main/res/mipmap-${density}`;
    await render(size, `${directory}/ic_launcher.png`);
    await render(size, `${directory}/ic_launcher_round.png`);
    await render((size * 108) / 48, `${directory}/ic_launcher_foreground.png`, 16);
  }
  await render(1024, 'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png');
  console.log('help by Ine launcher icons generated.');
} finally {
  await browser.close();
}
