export function createReporter(options = {}) {
  /** @type {{ name: string, score: number, start: number, end: number, drivers: any[], className?: string }[]} */
  const stack = [];
  /** @type {import('./plugin-api.js').FunctionScore[]} */
  const functions = [];
  let total = 0;
  const methodsOnly = options.methodsOnly || false;
  let currentClass = null;

  return {
    /** @param {number} weight @param {Partial<import('./plugin-api.js').Driver>=} meta */
    add(weight, meta) {
      if (methodsOnly && stack.length === 0) {
        return;
      }
      
      total += weight;
      if (stack.length) {
        const top = stack[stack.length - 1];
        top.score += weight;
        if (meta) top.drivers.push({ ...meta, weight });
      }
    },
    /** @param {string} name @param {{start:number,end:number}} loc @param {{className?:string}=} opts */
    enterFunction(name, loc, opts = {}) {
      stack.push({ 
        name, 
        score: 0, 
        start: loc.start, 
        end: loc.end, 
        drivers: [],
        className: opts.className || currentClass
      });
    },
    exitFunction() {
      const f = stack.pop();
      if (!f) return;
      
      const sortedDrivers = [...f.drivers].sort((a, b) => b.weight - a.weight);
      
      functions.push({ 
        name: f.name, 
        score: f.score, 
        loc: { start: f.start, end: f.end }, 
        topDrivers: sortedDrivers.slice(0, 5),
        allDrivers: sortedDrivers,
        className: f.className
      });
    },
    /** @param {string|null} name */
    enterClass(name) {
      currentClass = name;
    },
    exitClass() {
      currentClass = null;
    },
    finalize() {
      return { total, functions };
    }
  };
}
