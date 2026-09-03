/* Снимает скриншоты для README с локальной сборки.
   Запуск: npm run build && npm run preview, затем node scripts/screenshots.mjs
   (или просто npm run screenshots — он делает это сам). */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const BASE = process.env.SCREENSHOT_BASE ?? 'http://localhost:4173';
const OUT = 'docs/screenshots';

const shots = [
  { name: 'home-ember', path: '/', theme: 'ember', lang: 'en' },
  { name: 'home-daylight', path: '/', theme: 'daylight', lang: 'en' },
  { name: 'about-twilight', path: '/', theme: 'twilight', lang: 'en', anchor: 'about' },
  { name: 'currency', path: '/currency', theme: 'ember', lang: 'en' },
  { name: 'practice', path: '/practice', theme: 'ember', lang: 'en' },
];

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2, // retina — иначе текст в README выглядит мылом
});

for (const { name, path, theme, lang, anchor } of shots) {
  const page = await context.newPage();

  /* Тема и язык читаются из localStorage до рендера, поэтому
     кладём их ДО перехода на страницу, а не после. */
  await page.addInitScript(
    ([t, l]) => {
      localStorage.setItem('al-theme', t);
      localStorage.setItem('al-lang', l);
    },
    [theme, lang],
  );

  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600); // шрифты и флаги

  if (anchor) {
    await page.locator(`#${anchor}`).scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
  }

  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log(`✓ ${name}.png`);
  await page.close();
}

/* Мобильный вид с раскрытым меню — доказывает, что бургер работает. */
const mobile = await browser.newContext({
  viewport: { width: 390, height: 780 },
  deviceScaleFactor: 2,
});
const page = await mobile.newPage();
await page.addInitScript(() => localStorage.setItem('al-theme', 'ember'));
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await page.getByRole('button', { name: 'Menu' }).click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/mobile-menu.png` });
console.log('✓ mobile-menu.png');

await browser.close();
