import _traverse from '@babel/traverse';
import * as t from '@babel/types';
const traverse = _traverse.default || _traverse;
import { detectLang } from '../modes/lang/detect.js';
import { detectReact } from '../modes/react/detect.js';
import { analyzeLang } from './scorer-lang.js';
import { analyzeReact } from './scorer-react.js';
import { createReporter } from './reporter.js';

export function builtinLangMode() {
  return { 
    id: 'lang', 
    detect: detectLang, 
    analyze: ({ ast, report }) => analyzeLang(ast, report) 
  };
}

export function builtinReactMode() {
  return { 
    id: 'react', 
    detect: detectReact, 
    analyze: ({ ast, report }) => analyzeReact(ast, report) 
  };
}

/** @param {{ modes?: any[] }} opts */
export function createAnalyzer(opts = {}) {
  const modes = [builtinLangMode(), builtinReactMode(), ...(opts.modes || [])];

  /**
   * @param {import('@babel/types').File} ast
   * @param {string} filePath
   * @param {string} source
   */
  function detectBest(ast, filePath, source) {
    const ext = filePath.split('.').pop() ? `.${filePath.split('.').pop()}` : '';
    const ctxBase = { filePath, source, ast, ext, env: {}, config: {}, utils: { traverse, t } };
    /** @type {{mode:any, result:any}[]} */
    const candidates = modes.map(m => ({ mode: m, result: m.detect(ctxBase) }));

    return Promise.all(candidates.map(async c => ({ mode: c.mode, result: await c.result }))).then(res => {
      const forced = res.find(r => r.result && r.result.force);
      if (forced) return forced.mode;
      res.sort((a, b) => (b.result?.confidence || 0) - (a.result?.confidence || 0));
      return (res[0] && res[0].mode) || modes[0];
    });
  }

  async function analyze(ast, filePath, source, mode, options = {}) {
    const report = createReporter(options);
    const ctx = { filePath, source, ast, config: {}, report, utils: { traverse, t } };
    const out = await mode.analyze(ctx);
    return out;
  }

  return { detectBest, analyze, modes };
}
