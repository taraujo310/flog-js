import { describe, it, expect } from 'vitest';
import { createReporter } from '../src/core/reporter.js';

describe('Reporter', () => {
  it('should track total score', () => {
    const reporter = createReporter();
    reporter.add(1.0);
    reporter.add(2.5);
    const result = reporter.finalize();
    expect(result.total).toBe(3.5);
  });

  it('should track function scores', () => {
    const reporter = createReporter();
    reporter.enterFunction('myFunc', { start: 1, end: 10 });
    reporter.add(1.0, { kind: 'IfStatement' });
    reporter.add(2.0, { kind: 'ForStatement' });
    reporter.exitFunction();

    const result = reporter.finalize();
    expect(result.functions).toHaveLength(1);
    expect(result.functions[0].name).toBe('myFunc');
    expect(result.functions[0].score).toBe(3.0);
  });

  it('should limit topDrivers to 5', () => {
    const reporter = createReporter();
    reporter.enterFunction('myFunc', { start: 1, end: 10 });
    for (let i = 0; i < 10; i++) {
      reporter.add(1.0, { kind: `Driver${i}` });
    }
    reporter.exitFunction();

    const result = reporter.finalize();
    expect(result.functions[0].topDrivers).toHaveLength(5);
  });

  it('should handle nested functions', () => {
    const reporter = createReporter();
    reporter.enterFunction('outer', { start: 1, end: 20 });
    reporter.add(1.0);
    reporter.enterFunction('inner', { start: 5, end: 10 });
    reporter.add(2.0);
    reporter.exitFunction();
    reporter.add(0.5);
    reporter.exitFunction();

    const result = reporter.finalize();
    expect(result.functions).toHaveLength(2);
    expect(result.functions[0].name).toBe('inner');
    expect(result.functions[0].score).toBe(2.0);
    expect(result.functions[1].name).toBe('outer');
    expect(result.functions[1].score).toBe(1.5);
  });
});
