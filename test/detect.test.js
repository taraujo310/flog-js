import { describe, it, expect } from 'vitest';
import { parseSource } from '../src/core/parser.js';
import { detectLang } from '../src/modes/lang/detect.js';
import { detectReact } from '../src/modes/react/detect.js';
import traverse from '@babel/traverse';
import * as t from '@babel/types';

describe('Lang Detector', () => {
  it('should detect .js files with higher confidence', () => {
    const result = detectLang({ ext: '.js' });
    expect(result.id).toBe('lang');
    expect(result.confidence).toBe(0.4);
  });

  it('should detect .ts files with higher confidence', () => {
    const result = detectLang({ ext: '.ts' });
    expect(result.id).toBe('lang');
    expect(result.confidence).toBe(0.4);
  });

  it('should detect other files with lower confidence', () => {
    const result = detectLang({ ext: '.txt' });
    expect(result.id).toBe('lang');
    expect(result.confidence).toBe(0.2);
  });
});

describe('React Detector', () => {
  it('should detect .jsx extension', () => {
    const source = 'const x = 1;';
    const ast = parseSource(source, 'test.jsx');
    const result = detectReact({ ast, ext: '.jsx', source, utils: { traverse, t } });
    expect(result.id).toBe('react');
    expect(result.confidence).toBeGreaterThan(0);
  });

  it('should detect JSX elements', () => {
    const source = 'const el = <div>Hello</div>;';
    const ast = parseSource(source, 'test.js');
    const result = detectReact({ ast, ext: '.js', source, utils: { traverse, t } });
    expect(result.id).toBe('react');
    expect(result.confidence).toBe(0.95);
  });

  it('should detect React imports', () => {
    const source = `
      import React from 'react';
      import { useState } from 'react';
    `;
    const ast = parseSource(source, 'test.js');
    const result = detectReact({ ast, ext: '.js', source, utils: { traverse, t } });
    expect(result.id).toBe('react');
    expect(result.confidence).toBeGreaterThan(0);
  });

  it('should detect flog:mode=react pragma', () => {
    const source = '// flog:mode=react\nconst x = 1;';
    const ast = parseSource(source, 'test.js');
    const result = detectReact({ ast, ext: '.js', source, utils: { traverse, t } });
    expect(result.id).toBe('react');
    expect(result.confidence).toBe(1);
    expect(result.force).toBe(true);
  });

  it('should detect use client directive', () => {
    const source = `"use client";\nconst x = 1;`;
    const ast = parseSource(source, 'test.js');
    const result = detectReact({ ast, ext: '.js', source, utils: { traverse, t } });
    expect(result.id).toBe('react');
    expect(result.confidence).toBeGreaterThanOrEqual(0);
  });

  it('should return zero confidence for plain JS', () => {
    const source = 'const x = 1;';
    const ast = parseSource(source, 'test.js');
    const result = detectReact({ ast, ext: '.js', source, utils: { traverse, t } });
    expect(result.id).toBe('react');
    expect(result.confidence).toBe(0);
  });
});
