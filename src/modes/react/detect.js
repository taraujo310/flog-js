import _traverse from '@babel/traverse';
const traverse = _traverse.default || _traverse;

export function detectReact({ ast, ext, source }) {
  let strong = 0;
  let medium = 0;
  const reasons = [];

  if (/\.(jsx|tsx|mdx)$/.test(ext)) {
    strong++;
    reasons.push('ext');
  }
  
  if (/flog:mode=react/.test(source.slice(0, 512))) {
    return { id: 'react', confidence: 1, reasons: ['pragma'], force: true };
  }

  traverse(ast, {
    JSXElement() {
      strong++;
      reasons.push('JSX');
    },
    JSXFragment() {
      strong++;
      reasons.push('JSX');
    },
    ImportDeclaration(p) {
      const v = p.node.source.value;
      if (v === 'react' || v === 'react/jsx-runtime' || v === 'react/jsx-dev-runtime' || v === 'preact/compat') {
        medium++;
        reasons.push(`import:${v}`);
      }
    },
    Program(p) {
      const directives = p.node.directives || [];
      for (const directive of directives) {
        const v = directive.value.value;
        if (v === 'use client' || v === 'use server') {
          medium++;
          reasons.push(`directive:${v}`);
        }
      }
    }
  });

  const confidence = strong > 0 ? 0.95 : (medium >= 2 ? 0.75 : 0.0);
  return { id: 'react', confidence, reasons };
}
