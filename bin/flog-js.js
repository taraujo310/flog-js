#!/usr/bin/env node
import { analyzePaths } from '../src/cli.js';
import { parseArgs } from '../src/utils/args-parser.js';

const argv = process.argv.slice(2);

if (argv.includes('-h') || argv.includes('--help')) {
  console.log(`
flog-js - JavaScript code complexity analyzer

Usage: flog-js [options] <files|dirs...>

Options:
  -a, --all              Show all results (no 60% cutoff)
  -c, --continue         Continue on parse errors
  -d, --details          Show function details with drivers
  -g, --group            Group results by class/component
  -q, --quiet            Suppress error messages
  -s, --score            Show only total score
  -t, --threshold=N      Cutoff threshold (percentage or score:N)
  -v, --verbose          Show progress and detection details
  -m, --methods-only     Ignore code outside functions
  -z, --zero             Show zero-score methods in grouped output
  -h, --help             Show this help message

Examples:
  flog-js src/
  flog-js --details --threshold=score:10 src/
  flog-js -v -c src/ test/
  `);
  process.exit(0);
}

const { options, files } = parseArgs(argv);

if (!files.length) {
  console.error('Usage: flog-js [options] <files|globs...>');
  console.error('Use --help for more information');
  process.exit(1);
}

analyzePaths(files, options).catch(err => {
  if (!options.quiet) {
    console.error(err);
  }
  process.exit(1);
});
