import { describe, it, expect } from 'vitest';
import { createReporterManager } from '../src/reporters/reporter-manager.js';
import { jsonReporter } from '../src/reporters/json.js';
import { htmlReporter } from '../src/reporters/html.js';

describe('Reporter System', () => {
  const mockResults = [
    {
      file: '/path/to/app.js',
      mode: 'lang',
      total: 15.3,
      functions: [
        { name: 'test', score: 10.0, loc: { start: 1, end: 10 }, topDrivers: [{ kind: 'IfStatement', weight: 1.0 }] }
      ]
    }
  ];

  it('should create reporter manager with built-in reporters', () => {
    const manager = createReporterManager();

    expect(manager.getReporter('json')).toBeDefined();
    expect(manager.getReporter('html')).toBeDefined();
  });

  it('should generate JSON report', async () => {
    const output = await jsonReporter.generate(mockResults);
    const parsed = JSON.parse(output);

    expect(parsed.summary.totalFiles).toBe(1);
    expect(parsed.summary.totalScore).toBe(15.3);
    expect(parsed.files[0].file).toBe('/path/to/app.js');
  });

  it('should generate HTML report', async () => {
    const output = await htmlReporter.generate(mockResults);

    expect(output).toContain('<!DOCTYPE html>');
    expect(output).toContain('flog-js Report');
    expect(output).toContain('app.js');
  });

  it('should support custom reporters', () => {
    const customReporter = {
      id: 'custom',
      name: 'Custom',
      extension: '.txt',
      generate: () => 'custom output'
    };

    const manager = createReporterManager({ reporters: [customReporter] });

    expect(manager.getReporter('custom')).toBeDefined();
  });

  it('should handle anonymous functions in HTML report', async () => {
    const resultsWithAnonymous = [
      {
        file: '/path/to/test.js',
        mode: 'lang',
        total: 5.0,
        functions: [
          { name: '', score: 5.0, loc: { start: 10, end: 20 }, topDrivers: [] },
          { name: '   ', score: 3.0, loc: { start: 25, end: 30 }, topDrivers: [] },
          { name: null, score: 2.0, loc: { start: 35, end: 40 }, topDrivers: [] }
        ]
      }
    ];

    const output = await htmlReporter.generate(resultsWithAnonymous, { details: true });
    
    expect(output).toContain('(anonymous)');
    expect(output).toContain(':10-20');
    expect(output).toContain(':25-30');
    expect(output).toContain(':35-40');
  });

  it('should show file names without link styling', async () => {
    const output = await htmlReporter.generate(mockResults);

    expect(output).toContain('.file-name');
    expect(output).toContain('color: #495057');
    expect(output).not.toContain('color: #007bff');
  });
});
