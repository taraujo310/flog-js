# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] - 2025-10-16

### ✨ Implemented Features

#### Pluggable Reporter System
- **JSON Reporter** - Structured reports for CI/CD
- **HTML Reporter** - Modern, responsive visual reports
  - Shows code lines for each function (`:start-end`)
  - Identifies anonymous functions as `(anonymous)`
  - Neutral colors for file names (no link appearance)
- **Reporter Manager** - Custom reporter management
- **CLI Flag `--output`** - Save reports to files
- **Programmatic API** - `createReporterManager()`, `jsonReporter`, `htmlReporter`

#### CLI Flags
- `-a, --all` - Show all results (no 60% cutoff)
- `-c, --continue` - Continue on parse errors
- `-d, --details` - Show function details with drivers (complete breakdown with `-g`)
- `-g, --group` - Group results by class/component
- `-q, --quiet` - Suppress error messages
- `-s, --score` - Show only total score
- `-t, --threshold=N` - Cutoff by percentage or minimum score
- `-v, --verbose` - Show progress and detection details
- `-m, --methods-only` - Ignore code outside functions
- `-z, --zero` - Show zero-score methods in `-g` mode
- `-o, --output=FILE` - Save report to file (JSON/HTML)

#### Mode System
- **Lang Mode** - Vanilla JavaScript/TypeScript analysis
- **React Mode** - React analysis with JSX-specific penalties
- **Mode Detection** - Automatic code type detection
- **Pluggable Architecture** - Custom mode support

#### Complexity Analysis
- **Babel Parser** - Full modern syntax support
- **AST Traversal** - Deep code analysis
- **Penalty System** - 15+ penalty types
- **Function-level Scoring** - Per-function scoring with drivers
- **Class/Component Grouping** - Group by class or component

#### Tests
- **61 tests** passing in 9 files
- **Coverage** - 68.69% (core >75%)
- **Vitest** - Modern testing framework
- **Test Coverage** - `npm run test:coverage`

#### Documentation
- `README.md` - Overview and quick start
- `docs/CLI_FLAGS.md` - Complete flags documentation
- `docs/REPORTERS.md` - Reporters guide
- `docs/COVERAGE.md` - Coverage analysis

### 🎯 Main Features

#### Code Analysis
```bash
# Basic analysis
flog-js src/

# With details and grouping
flog-js -g -d src/

# Filter by complexity
flog-js --threshold=score:20 src/

# Methods only (ignore top-level)
flog-js -m src/
```

#### Report Generation
```bash
# JSON for CI/CD
flog-js --output=report.json src/

# Visual HTML
flog-js --output=report.html -d src/

# Combined with other flags
flog-js -o report.json -d -a src/
```

#### Programmatic API
```javascript
import { 
  analyzePaths, 
  createAnalyzer,
  createReporterManager,
  jsonReporter,
  htmlReporter
} from 'flog-js';

// Analysis
const results = await analyzePaths(['src/']);

// Reports
const manager = createReporterManager();
const json = await manager.generate('json', results);
const html = await manager.generate('html', results, { details: true });
```

### 📊 Penalties

#### JavaScript/TypeScript
- `IfStatement`: 1.0
- `TryStatement`: 1.5
- `ForStatement`: 1.0
- `WhileStatement`: 1.0
- `SwitchStatement`: 1.0
- `ConditionalExpression`: 1.0
- `CatchClause`: 0.5
- `LogicalExpression`: 0.5
- `AwaitExpression`: 0.5
- `CallExpression`: 0.1
- `DynamicCall` (eval): 4.0

#### React/JSX
- `JSX.Ternary`: 1.0
- `JSX.Map`: 0.8
- `JSX.Logical`: 0.6
- `JSX.Inline`: 0.4
- `JSX.Depth`: 0.3
- `Hook.useEffect`: 0.8
- `Hook.useReducer`: 0.6
- `Hook.useContext`: 0.3

### 🏗️ Arquitetura

```
src/
├── core/               # Core engine
│   ├── parser.js
│   ├── reporter.js
│   ├── scorer-lang.js
│   ├── scorer-react.js
│   ├── mode-manager.js
│   └── plugin-api.js
├── modes/              # Mode detection
│   ├── lang/
│   └── react/
├── reporters/          # Reporters system
│   ├── reporter-api.js
│   ├── reporter-manager.js
│   ├── json.js
│   └── html.js
└── utils/
    └── args-parser.js
```

### 🔧 Dependencies

**Production:**
- `@babel/parser` ^7.25.0
- `@babel/traverse` ^7.25.0
- `@babel/types` ^7.25.0
- `picomatch` ^4.0.0

**Development:**
- `vitest` ^2.0.0
- `@vitest/coverage-v8` ^2.0.0
- `eslint` ^9.0.0
- `prettier` ^3.0.0

### 📝 Exports

```json
{
  "exports": {
    ".": "./src/index.js",
    "./plugin-api": "./src/core/plugin-api.js",
    "./reporter-api": "./src/reporters/reporter-api.js"
  }
}
```

### 🚀 Performance

- **Parser** - Optimized Babel
- **Zero-compile** - Pure ESM, no build step
- **Incremental** - File-by-file analysis
- **Streaming** - Progressive output

### 🎨 Quality

- ✅ **ESLint** - Configured linting
- ✅ **Prettier** - Consistent formatting
- ✅ **Vitest** - Fast tests
- ✅ **TypeScript JSDoc** - Type hints
- ✅ **Code Coverage** - Coverage metrics

### 📚 Examples

**Included example files:**
- `examples/sample-complex.js` - Complex functions
- `examples/sample-classes.js` - JavaScript classes
- `examples/sample-components.jsx` - React components

### 🐛 Bug Fixes

None (initial release)

### ⚠️ Breaking Changes

None (initial release)

### 🔜 Next Steps

1. Create additional reporters (Markdown, CSV)
2. Add CI/CD
3. Publish to npm
4. Create example plugin (RxJS)
5. Monorepo support
6. Analysis caching
7. Complete `.flogrc.json` configuration

---

## Format

This changelog follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

### Change Types

- **Added** - For new features
- **Changed** - For changes in existing functionality
- **Deprecated** - For soon-to-be removed features
- **Removed** - For removed features
- **Fixed** - For bug fixes
- **Security** - For security vulnerabilities
