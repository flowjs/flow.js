import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { startServer } from './test-server.mjs';

const require = createRequire(import.meta.url);

function getArg(name, fallback = null) {
  const index = process.argv.indexOf(name);
  if (index === -1) return fallback;
  return process.argv[index + 1] || fallback;
}

function hasFlag(name) {
  return process.argv.includes(name);
}

const BROWSERS = getArg('--browser', process.env.FLOW_BROWSER || 'all');
const CDP = getArg('--cdp', process.env.FLOW_CDP || 'http://127.0.0.1:9223');
const SPEC = getArg('--spec', process.env.FLOW_SPEC || '');
const EXCLUDE = getArg('--exclude', process.env.FLOW_EXCLUDE || '');
const TIMEOUT = Number(getArg('--timeout', process.env.FLOW_TIMEOUT || 180000));
const HEADED = hasFlag('--headed');
const COVERAGE = hasFlag('--coverage') || process.env.FLOW_COVERAGE === '1';
const COVERAGE_DIR = getArg(
  '--coverage-dir',
  process.env.FLOW_COVERAGE_DIR || path.join('coverage', 'raw')
);

let playwright;
try {
  playwright = require('playwright');
} catch (error) {
  console.error(
    'Playwright is not installed. Run `npm install` and ' +
    '`npx playwright install --with-deps chromium firefox webkit`.'
  );
  process.exit(2);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function withTimeout(promise, ms) {
  await Promise.race([promise, sleep(ms)]);
}

function browserList() {
  if (BROWSERS === 'all') {
    return ['chromium', 'firefox', 'webkit'];
  }
  return BROWSERS.split(',').map(name => name.trim()).filter(Boolean);
}

async function acquire(name) {
  if (name === 'chromium-cdp') {
    const browser = await playwright.chromium.connectOverCDP(CDP);
    return {browser, owned: false, label: 'chromium-cdp'};
  }
  const type = playwright[name];
  if (!type) {
    throw new Error(`unknown browser: ${name}`);
  }
  const browser = await type.launch({headless: !HEADED});
  return {browser, owned: true, label: name};
}

function saveCoverage(label, coverage) {
  if (!coverage) {
    return;
  }
  fs.mkdirSync(COVERAGE_DIR, {recursive: true});
  const file = path.join(COVERAGE_DIR, `${label}.json`);
  fs.writeFileSync(file, JSON.stringify(coverage));
  console.log(`coverage: ${file}`);
}

async function runOne(name, server) {
  const started = Date.now();
  let acquired = null;
  let context = null;
  try {
    acquired = await acquire(name);
    context = await acquired.browser.newContext();
    const page = await context.newPage();
    const url = `${server.url}/test/runner.html?v=${Date.now()}` +
      `&spec=${encodeURIComponent(SPEC)}` +
      `&exclude=${encodeURIComponent(EXCLUDE)}`;
    await page.goto(url, {waitUntil: 'domcontentloaded', timeout: 30000});
    await page.waitForFunction(
      () => window.__results && (window.__results.done || window.__results.error),
      null,
      {timeout: TIMEOUT, polling: 200}
    );
    const results = await page.evaluate(() => window.__results);
    const coverage = COVERAGE
      ? await page.evaluate(() => window.__coverage__ || null)
      : null;
    saveCoverage(acquired.label, coverage);

    const run = (results.specs || []).filter(spec => spec.status !== 'excluded');
    const failed = run.filter(spec => spec.status === 'failed');
    const summary = {
      browser: acquired.label,
      overall: results.overall,
      elapsedMs: Date.now() - started,
      run: run.length,
      failed: failed.length,
      error: results.error || null
    };
    console.log(JSON.stringify(summary, null, 2));
    for (const spec of failed) {
      console.log(`\nFAIL [${acquired.label}] ${spec.fullName}`);
      for (const failure of spec.failedExpectations) {
        console.log('  ' + failure.message);
      }
    }
    if (results.error) {
      console.log(`\nRUNNER ERROR [${acquired.label}]\n${results.error}`);
    }
    return failed.length || results.error || results.overall !== 'passed';
  } catch (error) {
    console.error(`\nERROR [${name}] ${error && error.stack || error}`);
    if (COVERAGE) {
      try {
        const page = context && context.pages()[0];
        const coverage = page && await page.evaluate(() => window.__coverage__ || null);
        saveCoverage(name, coverage);
      } catch {}
    }
    return true;
  } finally {
    if (context) {
      await withTimeout(context.close().catch(() => {}), 3000);
    }
    if (acquired && acquired.owned) {
      await withTimeout(acquired.browser.close().catch(() => {}), 5000);
    }
    // A connected browser belongs to the user; only the context is closed.
  }
}

async function main() {
  const server = await startServer();
  let failed = false;
  try {
    for (const name of browserList()) {
      if (await runOne(name, server)) {
        failed = true;
      }
    }
  } finally {
    await server.close();
  }
  // For a browser attached over CDP, the Playwright websocket keeps Node
  // alive. Exit explicitly; the user's browser is not closed.
  process.exit(failed ? 1 : 0);
}

main().catch(error => {
  console.error(error && error.stack || error);
  process.exitCode = 1;
});
