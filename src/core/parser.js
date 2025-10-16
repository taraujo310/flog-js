import { parse } from '@babel/parser';

/**
 * @param {string} source
 * @param {string} filePath
 * @returns {import('@babel/types').File}
 */
export function parseSource(source, filePath) {
  return parse(source, {
    sourceType: 'unambiguous',
    plugins: [
      'jsx',
      'typescript',
      'topLevelAwait',
      'importMeta',
      'importAssertions',
      'optionalChaining',
      'nullishCoalescingOperator',
      'objectRestSpread',
      'classProperties',
      'classPrivateProperties',
      'classPrivateMethods',
      ['decorators', { decoratorsBeforeExport: true }]
    ]
  });
}
