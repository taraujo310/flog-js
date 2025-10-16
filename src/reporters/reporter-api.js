/**
 * @typedef {Object} ReporterAPI
 * @property {string} id - Reporter ID (e.g., 'json', 'html', 'text')
 * @property {string} name - Human-readable name
 * @property {string} extension - File extension (e.g., '.json', '.html')
 * @property {(results: any[], options: any) => string|Promise<string>} generate - Generate report content
 */

/**
 * Create a reporter instance
 * @param {ReporterAPI} reporter
 * @returns {ReporterAPI}
 */
export function createReporter(reporter) {
  if (!reporter.id || !reporter.generate) {
    throw new Error('Reporter must have id and generate()');
  }
  
  return {
    id: reporter.id,
    name: reporter.name || reporter.id,
    extension: reporter.extension || '.txt',
    generate: reporter.generate
  };
}
