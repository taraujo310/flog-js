import fs from 'node:fs';
import path from 'node:path';

const defaults = {
  maxPerFunction: 20,
  maxPerComponent: 30,
  weights: {},
  exclude: ['**/*.test.*', '**/*.spec.*'],
  include: [],
  plugins: [],
  pluginConfig: {},
  detect: true,
  format: 'table'
};

export function loadConfig(cwd) {
  const rcJson = path.join(cwd, '.flogrc.json');
  if (fs.existsSync(rcJson)) {
    return JSON.parse(fs.readFileSync(rcJson, 'utf8'));
  }
  return {};
}

export function mergeConfig(overrides) {
  return { ...defaults, ...(overrides || {}) };
}
