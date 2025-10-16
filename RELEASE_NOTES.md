# flog-js v0.1.0 - Release Notes

**Release Date:** 2025-10-16  
**Status:** ✅ Ready for Production & npm Publication

---

## 🎉 First Stable Release

JavaScript code complexity analyzer inspired by the Ruby flog gem, now with modern features and a pluggable architecture.

---

## ✨ Key Features

### 📊 Complexity Analysis
- **Automatic Mode Detection** - Detects JavaScript/TypeScript vs React automatically
- **Function-Level Scoring** - Detailed complexity scores per function
- **Class/Component Grouping** - Group results by class or React component
- **15+ Penalty Types** - Comprehensive code pattern detection

### 🎨 Pluggable Reporter System
- **JSON Reporter** - Structured output for CI/CD integration
- **HTML Reporter** - Beautiful, responsive visual reports
- **Custom Reporters** - Extensible API for your own formats
- **CLI Integration** - `--output=file.json` or `--output=file.html`

### 🛠️ CLI (11 Flags)
```bash
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
```

### 💻 Programmatic API
```javascript
import { 
  analyzePaths, 
  createReporterManager,
  jsonReporter,
  htmlReporter 
} from 'flog-js';

const results = await analyzePaths(['src/']);
const manager = createReporterManager();
const html = await manager.generate('html', results, { details: true });
```

---

## 📦 Package Info

| Metric | Value |
|--------|-------|
| **Package Size** | 15.2 KB (compressed) |
| **Unpacked Size** | 47.3 KB |
| **Files** | 21 |
| **Dependencies** | 4 production, 4 dev |
| **Node Version** | >=18.17 |
| **License** | MIT |

---

## 🧪 Quality Metrics

- ✅ **61/61 tests passing**
- ✅ **68.69% code coverage** (core >75%)
- ✅ **Zero ESLint warnings**
- ✅ **Pure ESM** (no build step required)
- ✅ **TypeScript JSDoc** type hints
- ✅ **Fully documented** in English

---

## 📊 Penalty Weights

### JavaScript/TypeScript
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

### React/JSX
- `JSX.Ternary`: 1.0
- `JSX.Map`: 0.8
- `JSX.Logical`: 0.6
- `JSX.Inline`: 0.4
- `JSX.Depth`: 0.3
- `Hook.useEffect`: 0.8
- `Hook.useReducer`: 0.6
- `Hook.useContext`: 0.3

---

## 🚀 Quick Start

### Installation
```bash
npm install flog-js
```

### Basic Usage
```bash
# Analyze code
flog-js src/

# With grouping and details
flog-js -g -d src/

# Generate HTML report
flog-js --output=report.html -d src/

# Generate JSON for CI/CD
flog-js --output=report.json src/
```

---

## 🎨 Example Output

### Table Mode (default)
```
┌─────────┬─────────────────────┬────────┬─────────┐
│ (index) │ file                │ mode   │ total   │
├─────────┼─────────────────────┼────────┼─────────┤
│ 0       │ 'sample-complex.js' │ 'lang' │ '17.30' │
└─────────┴─────────────────────┴────────┴─────────┘
```

### Grouped Mode (`-g -d`)
```
18.3: flog total
  2.3: flog/method average

10.7: Watch total
   5.2: Watch#returnMemoOrCancelSale   sample-classes.js:2-14
   1.5:   TryStatement
   1.0:   IfStatement
   0.5:   CatchClause
```

### HTML Report
- Modern, responsive design
- Summary cards with metrics
- Table with mode badges
- Color-coded complexity levels
- Function details with line numbers
- Anonymous functions clearly marked

---

## 🔌 Extensibility

### Custom Modes
```javascript
const customMode = {
  id: 'custom',
  detect({ ast }) {
    return { id: 'custom', confidence: 0.8 };
  },
  analyze({ ast, report }) {
    // Your analysis logic
  }
};

const analyzer = createAnalyzer({ modes: [customMode] });
```

### Custom Reporters
```javascript
import { createReporter } from 'flog-js/reporter-api';

const csvReporter = createReporter({
  id: 'csv',
  extension: '.csv',
  generate(results) {
    return 'File,Mode,Score\n...';
  }
});
```

---

## 🐛 Known Issues

None at this time.

---

## 🔜 Roadmap

### v0.2.0
- [ ] Markdown reporter
- [ ] CSV reporter  
- [ ] CI/CD templates (GitHub Actions)
- [ ] Comparison mode (track changes over time)
- [ ] Configuration file support (`.flogrc.json`)

### Future
- [ ] XML/JUnit reporter
- [ ] Caching for faster analysis
- [ ] Monorepo support
- [ ] VS Code extension
- [ ] Online playground

---

## 📚 Documentation

- **README.md** - Complete guide with examples
- **CHANGELOG.md** - Detailed release history
- **Examples** - Sample files in `examples/` directory

---

## 🙏 Acknowledgments

- **[flog](https://github.com/seattlerb/flog)** - Original Ruby gem inspiration
- **Babel** - Powerful JavaScript parser
- **Vitest** - Modern testing framework

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) file

---

## 🔗 Links

- **Repository:** [github.com/your-username/flog-js](https://github.com/your-username/flog-js)
- **npm:** [npmjs.com/package/flog-js](https://npmjs.com/package/flog-js)
- **Issues:** [github.com/your-username/flog-js/issues](https://github.com/your-username/flog-js/issues)

---

## ✅ Ready to Publish

This package is ready for:
- ✅ npm publication (`npm publish`)
- ✅ Production use
- ✅ Community contributions
- ✅ Integration in CI/CD pipelines

---

**Thank you for using flog-js!** 🎉

If you find this tool useful, please consider:
- ⭐ Starring the repository
- 📢 Sharing with your network
- 🐛 Reporting issues
- 🤝 Contributing improvements
