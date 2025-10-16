import { describe, it, expect } from 'vitest';
import { parseSource } from '../src/core/parser.js';
import { createAnalyzer, builtinLangMode, builtinReactMode } from '../src/core/mode-manager.js';

describe('Mode Manager', () => {
  it('should provide builtin modes', () => {
    const langMode = builtinLangMode();
    const reactMode = builtinReactMode();

    expect(langMode.id).toBe('lang');
    expect(reactMode.id).toBe('react');
  });

  it('should detect best mode for plain JS', async () => {
    const source = 'function test() { if (true) {} }';
    const ast = parseSource(source, 'test.js');
    const analyzer = createAnalyzer();

    const mode = await analyzer.detectBest(ast, 'test.js', source);
    expect(mode.id).toBe('lang');
  });

  it('should detect best mode for React', async () => {
    const source = 'function Component() { return <div>Hello</div>; }';
    const ast = parseSource(source, 'test.jsx');
    const analyzer = createAnalyzer();

    const mode = await analyzer.detectBest(ast, 'test.jsx', source);
    expect(mode.id).toBe('react');
  });

  it('should analyze code with detected mode', async () => {
    const source = 'function test() { if (true) {} }';
    const ast = parseSource(source, 'test.js');
    const analyzer = createAnalyzer();

    const mode = await analyzer.detectBest(ast, 'test.js', source);
    const result = await analyzer.analyze(ast, 'test.js', source, mode);

    expect(result.total).toBeGreaterThan(0);
    expect(result.functions).toBeDefined();
  });

  it('should accept custom modes', async () => {
    const customMode = {
      id: 'custom',
      detect: () => ({ id: 'custom', confidence: 0.1, reasons: [] }),
      analyze: ({ report }) => {
        report.add(100);
        return report.finalize();
      }
    };

    const analyzer = createAnalyzer({ modes: [customMode] });
    expect(analyzer.modes).toHaveLength(3);
  });

  it('should respect forced mode detection', async () => {
    const source = '// flog:mode=react\nconst x = 1;';
    const ast = parseSource(source, 'test.js');
    const analyzer = createAnalyzer();

    const mode = await analyzer.detectBest(ast, 'test.js', source);
    expect(mode.id).toBe('react');
  });
});
