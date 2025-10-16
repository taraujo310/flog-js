import _traverse from '@babel/traverse';
import * as t from '@babel/types';
const traverse = _traverse.default || _traverse;

const W = {
  IfStatement: 1.0,
  ConditionalExpression: 1.0,
  LogicalExpression: 0.5,
  ForStatement: 1.0,
  WhileStatement: 1.0,
  DoWhileStatement: 1.0,
  ForOfStatement: 1.0,
  ForInStatement: 1.0,
  SwitchStatement: 1.0,
  SwitchCase: 0.2,
  TryStatement: 1.5,
  CatchClause: 0.5,
  ThrowStatement: 0.5,
  AwaitExpression: 0.5,
  YieldExpression: 0.5,
  CallExpression: 0.1
};

function isDynamicCall(node) {
  const c = node.callee;
  if (t.isIdentifier(c) && (c.name === 'eval' || c.name === 'Function')) return true;
  if (t.isImport(c)) return true;
  return false;
}

function fnName(node) {
  if (node.id && node.id.name) return node.id.name;
  if (node.key && node.key.name) return node.key.name;
  return '<anonymous>';
}

/** @param {import('@babel/types').File} ast @param {ReturnType<import('./reporter.js').createReporter>} report */
export function analyzeLang(ast, report) {
  traverse(ast, {
    ClassDeclaration: {
      enter(p) {
        const name = p.node.id ? p.node.id.name : '<anonymous>';
        report.enterClass(name);
      },
      exit() {
        report.exitClass();
      }
    },
    enter(p) {
      const n = p.node;

      if (t.isFunction(n) || t.isArrowFunctionExpression(n)) {
        report.enterFunction(fnName(n), { 
          start: n.loc?.start.line || 0, 
          end: n.loc?.end.line || 0 
        });
      }

      const kind = n.type;
      if (W[kind]) report.add(W[kind], { kind });

      if (t.isCallExpression(n) && isDynamicCall(n)) {
        report.add(4.0, { kind: 'DynamicCall' });
      }

      if (t.isMemberExpression(n)) {
        let depth = 1;
        let cur = n.object;
        while (t.isMemberExpression(cur)) {
          depth++;
          cur = cur.object;
        }
        if (depth > 3) report.add(0.2, { kind: 'DeepMember' });
      }

      if (t.isAssignmentExpression(n) && ['&&=', '||=', '??='].includes(n.operator)) {
        report.add(0.4, { kind: 'LogicalAssign' });
      }
    },
    exit(p) {
      const n = p.node;
      if (t.isFunction(n) || t.isArrowFunctionExpression(n)) {
        report.exitFunction();
      }
    }
  });

  return report.finalize();
}
