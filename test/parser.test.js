import { describe, it, expect } from 'vitest';
import { parseSource } from '../src/core/parser.js';

describe('Parser', () => {
  it('should parse basic JavaScript', () => {
    const source = 'const x = 1;';
    const ast = parseSource(source, 'test.js');
    expect(ast.type).toBe('File');
    expect(ast.program.type).toBe('Program');
  });

  it('should parse JSX', () => {
    const source = 'const el = <div>Hello</div>;';
    const ast = parseSource(source, 'test.jsx');
    expect(ast.type).toBe('File');
  });

  it('should parse TypeScript', () => {
    const source = 'const x: number = 1;';
    const ast = parseSource(source, 'test.ts');
    expect(ast.type).toBe('File');
  });

  it('should parse modern features', () => {
    const source = `
      const obj = { ...spread };
      const val = obj?.prop ?? 'default';
      class MyClass {
        #private = 1;
      }
    `;
    const ast = parseSource(source, 'test.js');
    expect(ast.type).toBe('File');
  });
});
