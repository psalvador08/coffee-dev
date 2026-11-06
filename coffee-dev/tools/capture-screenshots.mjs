#!/usr/bin/env node
/**
 * Coffee.Dev — capture real screenshots of every project website.
 *
 * What it does
 *   1. Reads the project list from index.html and projects.html
 *      (every <img data-screenshot data-site="…" data-slug="…">).
 *   2. Opens each website in a real browser (1280 × 800) and saves a JPG to
 *      assets/images/projects/<slug>.jpg
 *   3. Points the <img> tags in both pages at those local files, replacing the
 *      live WordPress.com mShots preview. Sites that fail keep their live preview.
 *
 * How to run (from the project folder, needs Node.js 18+):
 *   cd tools
 *   npm install
 *   npx playwright install chromium
 *   npm run capture                     # all projects
 *   npm run capture -- --only presidium # one or more slugs, comma-separated
 *   npm run capture -- --no-update      # save JPGs but leave the HTML unchanged
 *
 * Afterwards: look at each JPG (cookie banners or pop-ups can appear in a capture),
 * then commit the new images and HTML.
 */
import { chromium } from 'playwright';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'assets', 'images', 'projects');
const PAGES = ['index.html', 'projects.html'];
const VIEWPORT = { width: 1280, height: 800 };

const args = process.argv.slice(2);
const onlyIndex = args.indexOf('--only');
const only = onlyIndex !== -1 ? (args[onlyIndex + 1] || '').split(',').map((s) => s.trim()).filter(Boolean) : null;
const updateHtml = !args.includes('--no-update');

const IMG_RE = /<img\b[^>]*\bdata-screenshot\b[^>]*>/g;
const attr = (tag, name) => {
  const m = tag.match(new RegExp(`\\b${name}="([^"]*)"`));
  return m ? m[1] : null;
};

async function readProjects() {
  const projects = new Map();
  for (const page of PAGES) {
    const html = await readFile(path.join(ROOT, page), 'utf8');
    for (const tag of html.match(IMG_RE) || []) {
      const slug = attr(tag, 'data-slug');
      const site = attr(tag, 'data-site');
      if (slug && site) projects.set(slug, site);
    }
  }
  return projects;
}

async function capture(browser, slug, site) {
  const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1, locale: 'en-US' });
  const page = await context.newPage();
  try {
    try {
      await page.goto(site, { waitUntil: 'networkidle', timeout: 45000 });
    } catch {
      await page.goto(site, { waitUntil: 'load', timeout: 45000 });
    }
    await page.waitForTimeout(2500); // let sliders, fonts and fade-ins settle
    await page.evaluate(() => window.scrollTo(0, 0));
    const file = path.join(OUT_DIR, `${slug}.jpg`);
    await page.screenshot({ path: file, type: 'jpeg', quality: 80, clip: { x: 0, y: 0, ...VIEWPORT } });
    return file;
  } finally {
    await context.close();
  }
}

async function pointHtmlAtLocalFiles(slugs) {
  for (const page of PAGES) {
    const file = path.join(ROOT, page);
    let html = await readFile(file, 'utf8');
    html = html.replace(IMG_RE, (tag) => {
      const slug = attr(tag, 'data-slug');
      if (!slugs.includes(slug)) return tag;
      return tag.replace(/\bsrc="[^"]*"/, `src="assets/images/projects/${slug}.jpg"`);
    });
    await writeFile(file, html);
  }
}

const projects = await readProjects();
const todo = [...projects].filter(([slug]) => !only || only.includes(slug));
if (!todo.length) {
  console.error('No matching projects found.');
  process.exit(1);
}

await mkdir(OUT_DIR, { recursive: true });
const browser = await chromium.launch();
const done = [];
const failed = [];

for (const [slug, site] of todo) {
  process.stdout.write(`• ${slug.padEnd(14)} ${site} … `);
  try {
    const file = await capture(browser, slug, site);
    done.push(slug);
    console.log(`saved ${path.relative(ROOT, file)}`);
  } catch (error) {
    failed.push(slug);
    console.log(`FAILED (${error.message.split('\n')[0]})`);
  }
}
await browser.close();

if (updateHtml && done.length) {
  await pointHtmlAtLocalFiles(done);
  console.log(`\nUpdated index.html and projects.html to use ${done.length} local screenshot(s).`);
}
if (failed.length) {
  console.log(`\nCould not capture: ${failed.join(', ')}. These cards keep their live preview.`);
  process.exitCode = 1;
}
