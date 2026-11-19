import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');

export const versionIntro =
  `const __FLOW_VERSION__ = ${JSON.stringify(pkg.version)};`;
