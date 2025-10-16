import { describe, it, expect } from 'vitest';
import { parseSource } from '../src/core/parser.js';
import { createReporter } from '../src/core/reporter.js';
import { analyzeLang } from '../src/core/scorer-lang.js';

describe('Scorer Lang', () => {
  it('should score if statements', () => {
    const source = `
      function test() {
        if (true) {
          console.log('yes');
        }
      }
    `;
    const ast = parseSource(source, 'test.js');
    const reporter = createReporter();
    analyzeLang(ast, reporter);
    const result = reporter.finalize();

    expect(result.total).toBeGreaterThan(0);
    expect(result.functions).toHaveLength(1);
  });

  it('should score loops', () => {
    const source = `
      function test() {
        for (let i = 0; i < 10; i++) {}
        while (true) {}
      }
    `;
    const ast = parseSource(source, 'test.js');
    const reporter = createReporter();
    analyzeLang(ast, reporter);
    const result = reporter.finalize();

    expect(result.total).toBeGreaterThanOrEqual(2);
  });

  it('should score try-catch', () => {
    const source = `
      function test() {
        try {
          throw new Error();
        } catch (e) {
          console.log(e);
        }
      }
    `;
    const ast = parseSource(source, 'test.js');
    const reporter = createReporter();
    analyzeLang(ast, reporter);
    const result = reporter.finalize();

    expect(result.total).toBeGreaterThan(2);
  });

  it('should score dynamic calls', () => {
    const source = `
      function test() {
        eval('1 + 1');
      }
    `;
    const ast = parseSource(source, 'test.js');
    const reporter = createReporter();
    analyzeLang(ast, reporter);
    const result = reporter.finalize();

    expect(result.total).toBeGreaterThan(4);
  });

  it('should track multiple functions', () => {
    const source = `
      function a() {
        if (true) {}
      }
      function b() {
        for (let i = 0; i < 10; i++) {}
      }
    `;
    const ast = parseSource(source, 'test.js');
    const reporter = createReporter();
    analyzeLang(ast, reporter);
    const result = reporter.finalize();

    expect(result.functions).toHaveLength(2);
  });
});
