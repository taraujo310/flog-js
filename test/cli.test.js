import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { analyzePaths } from '../src/cli.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.join(__dirname, 'fixtures');

describe('CLI', () => {
  beforeEach(() => {
    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(fixturesDir)) {
      fs.rmSync(fixturesDir, { recursive: true, force: true });
    }
  });

  it('should analyze a single file', async () => {
    const testFile = path.join(fixturesDir, 'test.js');
    fs.writeFileSync(testFile, 'function test() { if (true) {} }');

    const results = await analyzePaths([testFile]);

    expect(results).toHaveLength(1);
    expect(results[0].file).toBe(testFile);
    expect(results[0].mode).toBeDefined();
    expect(results[0].total).toBeGreaterThan(0);
  });

  it('should analyze multiple files', async () => {
    const file1 = path.join(fixturesDir, 'file1.js');
    const file2 = path.join(fixturesDir, 'file2.js');
    fs.writeFileSync(file1, 'function a() { if (true) {} }');
    fs.writeFileSync(file2, 'function b() { for(;;) {} }');

    const results = await analyzePaths([file1, file2]);

    expect(results).toHaveLength(2);
  });

  it('should sort results by total score', async () => {
    const file1 = path.join(fixturesDir, 'simple.js');
    const file2 = path.join(fixturesDir, 'complex.js');
    fs.writeFileSync(file1, 'const x = 1;');
    fs.writeFileSync(file2, 'function test() { if (true) { for(;;) { try {} catch {} } } }');

    const results = await analyzePaths([file1, file2]);

    expect(results[0].total).toBeGreaterThanOrEqual(results[1].total);
  });

  it('should detect React files', async () => {
    const testFile = path.join(fixturesDir, 'component.jsx');
    fs.writeFileSync(testFile, 'function App() { return <div>Hello</div>; }');

    const results = await analyzePaths([testFile]);

    expect(results[0].mode).toBe('react');
  });

  it('should handle directory input', async () => {
    const subDir = path.join(fixturesDir, 'src');
    fs.mkdirSync(subDir, { recursive: true });
    fs.writeFileSync(path.join(subDir, 'file1.js'), 'const x = 1;');
    fs.writeFileSync(path.join(subDir, 'file2.js'), 'const y = 2;');

    const results = await analyzePaths([fixturesDir]);

    expect(results.length).toBeGreaterThan(0);
  });
});
