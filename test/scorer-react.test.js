import { describe, it, expect } from 'vitest';
import { parseSource } from '../src/core/parser.js';
import { createReporter } from '../src/core/reporter.js';
import { analyzeReact } from '../src/core/scorer-react.js';

describe('Scorer React', () => {
  it('should score JSX ternary', () => {
    const source = `
      function Component() {
        return <div>{condition ? <A /> : <B />}</div>;
      }
    `;
    const ast = parseSource(source, 'test.jsx');
    const reporter = createReporter();
    analyzeReact(ast, reporter);
    const result = reporter.finalize();

    expect(result.total).toBeGreaterThan(0);
  });

  it('should score JSX logical expressions', () => {
    const source = `
      function Component() {
        return <div>{condition && <Child />}</div>;
      }
    `;
    const ast = parseSource(source, 'test.jsx');
    const reporter = createReporter();
    analyzeReact(ast, reporter);
    const result = reporter.finalize();

    expect(result.total).toBeGreaterThan(0);
  });

  it('should score map calls in JSX', () => {
    const source = `
      function Component() {
        return <div>{items.map(i => <Item key={i} />)}</div>;
      }
    `;
    const ast = parseSource(source, 'test.jsx');
    const reporter = createReporter();
    analyzeReact(ast, reporter);
    const result = reporter.finalize();

    expect(result.total).toBeGreaterThan(0);
  });

  it('should score useEffect hook', () => {
    const source = `
      function Component() {
        useEffect(() => {
          console.log('mounted');
        }, []);
      }
    `;
    const ast = parseSource(source, 'test.jsx');
    const reporter = createReporter();
    analyzeReact(ast, reporter);
    const result = reporter.finalize();

    expect(result.total).toBeGreaterThan(0);
  });

  it('should score useEffect with dependencies', () => {
    const source = `
      function Component() {
        useEffect(() => {
          console.log('effect');
        }, [dep1, dep2, dep3]);
      }
    `;
    const ast = parseSource(source, 'test.jsx');
    const reporter = createReporter();
    analyzeReact(ast, reporter);
    const result = reporter.finalize();

    expect(result.total).toBeGreaterThan(0);
  });

  it('should score useEffect with cleanup', () => {
    const source = `
      function Component() {
        useEffect(() => {
          return () => console.log('cleanup');
        }, []);
      }
    `;
    const ast = parseSource(source, 'test.jsx');
    const reporter = createReporter();
    analyzeReact(ast, reporter);
    const result = reporter.finalize();

    expect(result.total).toBeGreaterThan(0);
  });

  it('should score deep JSX nesting', () => {
    const source = `
      function Component() {
        return (
          <div>
            <div>
              <div>
                <div>
                  <div>
                    <div>
                      <div>Deep</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
    `;
    const ast = parseSource(source, 'test.jsx');
    const reporter = createReporter();
    analyzeReact(ast, reporter);
    const result = reporter.finalize();

    expect(result.total).toBeGreaterThan(0);
  });
});
