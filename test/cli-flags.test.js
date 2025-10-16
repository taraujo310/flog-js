import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { analyzePaths } from '../src/cli.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.join(__dirname, 'fixtures-flags');

describe('CLI Flags', () => {
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

  describe('--all flag', () => {
    it('should show all results without cutoff', async () => {
      const files = [];
      for (let i = 0; i < 10; i++) {
        const file = path.join(fixturesDir, `file${i}.js`);
        fs.writeFileSync(file, `function f${i}() { if (true) {} }`);
        files.push(file);
      }

      const resultsDefault = await analyzePaths(files, { all: false, threshold: 60 });
      const resultsAll = await analyzePaths(files, { all: true });

      expect(resultsAll.length).toBeGreaterThan(resultsDefault.length);
    });
  });

  describe('--continue flag', () => {
    it('should continue on parse errors', async () => {
      const validFile = path.join(fixturesDir, 'valid.js');
      const invalidFile = path.join(fixturesDir, 'invalid.js');
      fs.writeFileSync(validFile, 'function test() { if (true) {} }');
      fs.writeFileSync(invalidFile, 'function test() { if (true }');

      const results = await analyzePaths([validFile, invalidFile], { continue: true });

      expect(results.length).toBe(1);
      expect(results[0].file).toBe(validFile);
    });

    it('should throw on parse errors without continue flag', async () => {
      const invalidFile = path.join(fixturesDir, 'invalid.js');
      fs.writeFileSync(invalidFile, 'function test() { if (true }');

      await expect(analyzePaths([invalidFile], { continue: false })).rejects.toThrow();
    });
  });

  describe('--details flag', () => {
    it('should include function details with drivers', async () => {
      const file = path.join(fixturesDir, 'complex.js');
      fs.writeFileSync(file, 'function test() { if (true) { for(;;) {} } }');

      const results = await analyzePaths([file], { details: true });

      expect(results[0].functions).toBeDefined();
      expect(results[0].functions[0].topDrivers).toBeDefined();
      expect(results[0].functions[0].topDrivers.length).toBeGreaterThan(0);
    });

    it('should show detailed penalty breakdown with -g -d', async () => {
      const file = path.join(fixturesDir, 'detailed.js');
      fs.writeFileSync(file, `
        class TestClass {
          complexMethod() {
            if (true) {
              for (let i = 0; i < 10; i++) {
                try {
                  if (i > 5) {
                    console.log(i);
                  }
                } catch (e) {
                  console.error(e);
                }
              }
            }
          }
        }
      `);

      const results = await analyzePaths([file], { group: true, details: true, quiet: true });
      const func = results[0].functions.find(f => f.name === 'complexMethod');

      expect(func).toBeDefined();
      expect(func.topDrivers).toBeDefined();
      expect(func.topDrivers.length).toBeGreaterThan(2);
      expect(func.topDrivers[0].weight).toBeGreaterThan(0);
      expect(func.topDrivers[0].kind).toBeDefined();
    });
  });

  describe('--score flag', () => {
    it('should return only total score', async () => {
      const file = path.join(fixturesDir, 'test.js');
      fs.writeFileSync(file, 'function test() { if (true) {} }');

      const results = await analyzePaths([file], { score: true });

      expect(results.totalScore).toBeDefined();
      expect(typeof results.totalScore).toBe('number');
    });
  });

  describe('--threshold flag', () => {
    it('should filter by percentage', async () => {
      const files = [];
      for (let i = 0; i < 10; i++) {
        const file = path.join(fixturesDir, `file${i}.js`);
        const complexity = i === 0 ? 'if (true) { for(;;) { try {} catch {} } }' : '';
        fs.writeFileSync(file, `function f${i}() { ${complexity} }`);
        files.push(file);
      }

      const results = await analyzePaths(files, { threshold: 10 });

      expect(results.length).toBeLessThan(files.length);
    });

    it('should filter by minimum score', async () => {
      const files = [];
      for (let i = 0; i < 5; i++) {
        const file = path.join(fixturesDir, `file${i}.js`);
        const complexity = i < 2 ? 'if (true) { for(;;) {} }' : '';
        fs.writeFileSync(file, `function f${i}() { ${complexity} }`);
        files.push(file);
      }

      const results = await analyzePaths(files, { threshold: 'score:2' });

      expect(results.every(r => r.total >= 2)).toBe(true);
    });
  });

  describe('--methods-only flag', () => {
    it('should ignore top-level code', async () => {
      const file = path.join(fixturesDir, 'mixed.js');
      fs.writeFileSync(file, `
        if (true) {} // top-level
        function test() { if (true) {} } // inside function
      `);

      const resultsAll = await analyzePaths([file], { methodsOnly: false });
      const resultsMethods = await analyzePaths([file], { methodsOnly: true });

      expect(resultsMethods[0].total).toBeLessThan(resultsAll[0].total);
    });
  });

  describe('--group flag', () => {
    it('should group by class in lang mode', async () => {
      const file = path.join(fixturesDir, 'classes.js');
      fs.writeFileSync(file, `
        class UserModel {
          validate() { if (true) { for(;;) {} } }
          save() { if (true) {} }
        }
        class ProductModel {
          validate() { if (true) {} }
        }
      `);

      const results = await analyzePaths([file], { group: true, quiet: true });

      expect(results[0].functions.some(f => f.name.includes('validate'))).toBe(true);
    });

    it('should group by component in react mode', async () => {
      const file = path.join(fixturesDir, 'components.jsx');
      fs.writeFileSync(file, `
        function UserCard() {
          return <div>{condition ? <A /> : <B />}</div>;
        }
        function ProductCard() {
          return <div>{items.map(i => <Item key={i} />)}</div>;
        }
      `);

      const results = await analyzePaths([file], { group: true, quiet: true });

      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('--zero flag', () => {
    it('should hide zero-score methods in grouped output by default', async () => {
      const file = path.join(fixturesDir, 'with-zeros.js');
      fs.writeFileSync(file, `
        class TestModel {
          complex() { if (true) { for(;;) {} } }
          simple() { return 42; }
          empty() {}
        }
      `);

      const results = await analyzePaths([file], { group: true, quiet: true });
      const zeroScoreFuncs = results[0].functions.filter(f => f.score === 0);

      expect(zeroScoreFuncs.length).toBeGreaterThan(0);
    });

    it('should show zero-score methods with -z flag', async () => {
      const file = path.join(fixturesDir, 'with-zeros.js');
      fs.writeFileSync(file, `
        class TestModel {
          complex() { if (true) { for(;;) {} } }
          simple() { return 42; }
          empty() {}
        }
      `);

      const results = await analyzePaths([file], { group: true, zero: true, quiet: true });
      const zeroScoreFuncs = results[0].functions.filter(f => f.score === 0);

      expect(zeroScoreFuncs.length).toBeGreaterThan(0);
    });
  });
});
