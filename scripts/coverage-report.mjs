import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const libCoverage = require('istanbul-lib-coverage');
const libReport = require('istanbul-lib-report');
const reports = require('istanbul-reports');

const inputDir = process.env.FLOW_COVERAGE_DIR || path.join('coverage', 'raw');
const outputDir = process.env.FLOW_COVERAGE_OUT || 'coverage';

if (!fs.existsSync(inputDir)) {
  console.error(`No coverage input directory: ${inputDir}`);
  process.exit(1);
}

const files = fs.readdirSync(inputDir).filter(name => name.endsWith('.json'));
if (files.length === 0) {
  console.error(`No coverage files in ${inputDir}`);
  process.exit(1);
}

const coverageMap = libCoverage.createCoverageMap({});
for (const file of files) {
  coverageMap.merge(JSON.parse(fs.readFileSync(path.join(inputDir, file), 'utf8')));
}

const context = libReport.createContext({
  dir: outputDir,
  coverageMap
});
reports.create('text').execute(context);
reports.create('text-summary').execute(context);
reports.create('lcovonly').execute(context);
reports.create('json-summary').execute(context);
console.log(`coverage report written to ${outputDir}`);
