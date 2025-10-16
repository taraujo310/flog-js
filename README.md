# 🪶 flog-js

JavaScript code complexity analyzer inspired by the [flog](https://github.com/seattlerb/flog) Ruby gem.

## Features

- **Zero-compile**: Pure JavaScript ESM, no build step required
- **Mode detection**: Automatically detects code type (vanilla JS/TS or React)
- **Pluggable architecture**: Extend with custom analysis modes
- **Function-level scores**: Track complexity per function with detailed drivers
- **Modern syntax support**: Handles JSX, TypeScript, decorators, and more

## Installation

```bash
npm install flog-js
```

## Usage

### CLI

```bash
# Analyze specific files
flog-js src/app.js src/utils.js

# Analyze all JS files in a directory
flog-js src/

# With options
flog-js --details --threshold=score:10 src/
flog-js -v -c src/ test/
flog-js --score --quiet src/
```

### CLI Options

```
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
  -o, --output=FILE      Save report to file (json/html)
  -h, --help             Show help message
```

See [CLI_FLAGS.md](./docs/CLI_FLAGS.md) for detailed documentation.

### Programmatic API

```javascript
import { analyzePaths, createAnalyzer, createReporterManager } from 'flog-js';

// Analyze files
const results = await analyzePaths(['src/app.js']);
console.log(results);

// Generate reports
const manager = createReporterManager();
const jsonReport = await manager.generate('json', results);
const htmlReport = await manager.generate('html', results, { details: true });

// Custom analyzer with modes
const analyzer = createAnalyzer({
  modes: [customMode]
});
```

## How it works

`flog-js` parses your code using Babel and traverses the AST to calculate complexity scores based on:

### JavaScript/TypeScript Mode
- Control flow: `if`, `for`, `while`, `switch` (+1.0 each)
- Error handling: `try` (+1.5), `catch` (+0.5)
- Async patterns: `await`, `yield` (+0.5)
- Dynamic calls: `eval`, `Function` (+4.0)
- Logical operators: `&&`, `||` (+0.5)

### React Mode
- JSX conditionals: ternaries (+1.0), logical expressions (+0.6)
- JSX maps (+0.8)
- Hooks: `useEffect` (+0.8), `useReducer` (+0.6)
- Component depth (penalty for deeply nested JSX)

## Configuration

Create a `.flogrc.json` in your project root:

```json
{
  "maxPerFunction": 20,
  "maxPerComponent": 30,
  "exclude": ["**/*.test.*", "**/*.spec.*"],
  "format": "table"
}
```

## Custom Modes

Create a plugin to analyze domain-specific patterns:

```javascript
import { createAnalyzer } from 'flog-js';

const rxjsMode = {
  id: 'rxjs',
  detect({ ast }) {
    // Detection logic
    return { id: 'rxjs', confidence: 0.8, reasons: ['import:rxjs'] };
  },
  analyze({ ast, report }) {
    // Analysis logic
    report.add(1.0, { kind: 'switchMap' });
    return report.finalize();
  }
};

const analyzer = createAnalyzer({ modes: [rxjsMode] });
```

## Reports

Generate reports in different formats:

```bash
# JSON report
flog-js --output=report.json src/

# HTML report with details
flog-js --output=report.html -d src/

# Save to file while showing progress
flog-js -o report.json -v src/
```

### Custom Reporters

Create custom report formats:

```javascript
import { createReporter, createReporterManager } from 'flog-js';

const markdownReporter = createReporter({
  id: 'markdown',
  extension: '.md',
  generate(results, options) {
    let md = '# Complexity Report\n\n';
    for (const r of results) {
      md += `- **${r.file}**: ${r.total}\n`;
    }
    return md;
  }
});

const manager = createReporterManager({ 
  reporters: [markdownReporter] 
});

const report = await manager.generate('markdown', results);
```

See [REPORTERS.md](./docs/REPORTERS.md) for detailed documentation.

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## License

MIT
