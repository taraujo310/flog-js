import { jsonReporter } from './json.js';
import { htmlReporter } from './html.js';

const builtinReporters = [jsonReporter, htmlReporter];

/**
 * Reporter Manager
 * Manages available reporters and generates reports
 */
export class ReporterManager {
  constructor(customReporters = []) {
    this.reporters = new Map();
    
    for (const reporter of [...builtinReporters, ...customReporters]) {
      this.reporters.set(reporter.id, reporter);
    }
  }
  
  /**
   * Get a reporter by ID
   * @param {string} id
   * @returns {import('./reporter-api.js').ReporterAPI|undefined}
   */
  getReporter(id) {
    return this.reporters.get(id);
  }
  
  /**
   * List all available reporters
   * @returns {import('./reporter-api.js').ReporterAPI[]}
   */
  listReporters() {
    return Array.from(this.reporters.values());
  }
  
  /**
   * Generate report using specified reporter
   * @param {string} reporterId
   * @param {any[]} results
   * @param {any} options
   * @returns {Promise<string>}
   */
  async generate(reporterId, results, options = {}) {
    const reporter = this.getReporter(reporterId);
    
    if (!reporter) {
      throw new Error(`Reporter '${reporterId}' not found`);
    }
    
    return await reporter.generate(results, options);
  }
}

/**
 * Create a reporter manager
 * @param {Object} options
 * @param {import('./reporter-api.js').ReporterAPI[]} options.reporters
 * @returns {ReporterManager}
 */
export function createReporterManager(options = {}) {
  return new ReporterManager(options.reporters || []);
}
