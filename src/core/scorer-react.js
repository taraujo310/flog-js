import _traverse from '@babel/traverse';
import * as t from '@babel/types';
const traverse = _traverse.default || _traverse;

const W = {
  JSX_Ternary: 1.0,
  JSX_Logical: 0.6,
  JSX_Map: 0.8,
  JSX_InlineFnOrLiteral: 0.4,
  JSX_DepthStep: 0.3,
  useEffect: 0.8,
  useEffectCleanup: 0.4,
  useLayoutEffect: 0.6,
  useReducer: 0.6,
  useReducerCase: 0.2,
  useContext: 0.3
};

function isMapCall(n) {
  return t.isCallExpression(n) && t.isMemberExpression(n.callee) && t.isIdentifier(n.callee.property, { name: 'map' });
}

function isComponentName(name) {
  return name && /^[A-Z]/.test(name);
}

function fnName(node) {
  if (node.id && node.id.name) return node.id.name;
  if (node.key && node.key.name) return node.key.name;
  return '<anonymous>';
}

export function analyzeReact(ast, report) {
  let depth = 0;
  let maxDepth = 0;

  traverse(ast, {
    enter(p) {
      const n = p.node;
      if (t.isFunction(n) || t.isArrowFunctionExpression(n)) {
        report.enterFunction(fnName(n), {
          start: n.loc?.start.line || 0,
          end: n.loc?.end.line || 0
        });
      }
    },
    exit(p) {
      const n = p.node;
      if (t.isFunction(n) || t.isArrowFunctionExpression(n)) {
        report.exitFunction();
      }
    },
    FunctionDeclaration: {
      enter(p) {
        const name = p.node.id ? p.node.id.name : '<anonymous>';
        if (isComponentName(name)) {
          report.enterClass(name);
        }
      },
      exit(p) {
        const name = p.node.id ? p.node.id.name : '<anonymous>';
        if (isComponentName(name)) {
          report.exitClass();
        }
      }
    },
    VariableDeclarator: {
      enter(p) {
        if (t.isIdentifier(p.node.id) && isComponentName(p.node.id.name)) {
          const init = p.node.init;
          if (t.isArrowFunctionExpression(init) || t.isFunctionExpression(init)) {
            report.enterClass(p.node.id.name);
          }
        }
      },
      exit(p) {
        if (t.isIdentifier(p.node.id) && isComponentName(p.node.id.name)) {
          const init = p.node.init;
          if (t.isArrowFunctionExpression(init) || t.isFunctionExpression(init)) {
            report.exitClass();
          }
        }
      }
    },
    JSXElement: {
      enter() {
        depth++;
        if (depth > maxDepth) maxDepth = depth;
      },
      exit() {
        depth--;
      }
    },
    JSXExpressionContainer(p) {
      const n = p.node.expression;
      if (t.isConditionalExpression(n)) {
        report.add(W.JSX_Ternary, { kind: 'JSX.Ternary' });
      }
      if (t.isLogicalExpression(n) && (n.operator === '&&' || n.operator === '||')) {
        report.add(W.JSX_Logical, { kind: 'JSX.Logical' });
      }
      if (isMapCall(n)) {
        report.add(W.JSX_Map, { kind: 'JSX.Map' });
      }
      if (t.isArrowFunctionExpression(n) || t.isFunctionExpression(n) || t.isObjectExpression(n) || t.isArrayExpression(n)) {
        report.add(W.JSX_InlineFnOrLiteral, { kind: 'JSX.Inline' });
      }
    },
    CallExpression(p) {
      const c = p.node.callee;
      const name = t.isIdentifier(c) ? c.name : (t.isMemberExpression(c) && t.isIdentifier(c.property) ? c.property.name : '');
      
      if (name === 'useEffect') {
        report.add(W.useEffect, { kind: 'Hook.useEffect' });
        const deps = p.node.arguments[1];
        if (t.isArrayExpression(deps)) {
          for (const el of deps.elements) {
            if (el) report.add(0.15, { kind: 'Hook.useEffect.dep' });
          }
        }
        const firstArg = p.node.arguments[0];
        if (t.isFunction(firstArg) || t.isArrowFunctionExpression(firstArg)) {
          let hasCleanup = false;
          traverse(firstArg.body, {
            ReturnStatement() {
              hasCleanup = true;
            }
          }, p.scope);
          if (hasCleanup) {
            report.add(W.useEffectCleanup, { kind: 'Hook.useEffect.cleanup' });
          }
        }
      }
      if (name === 'useLayoutEffect') {
        report.add(W.useLayoutEffect, { kind: 'Hook.useLayoutEffect' });
      }
      if (name === 'useContext') {
        report.add(W.useContext, { kind: 'Hook.useContext' });
      }
      if (name === 'useReducer') {
        report.add(W.useReducer, { kind: 'Hook.useReducer' });
      }
    }
  });

  if (maxDepth > 5) {
    report.add((maxDepth - 5) * W.JSX_DepthStep, { kind: 'JSX.Depth', message: `depth=${maxDepth}` });
  }

  return report.finalize();
}
