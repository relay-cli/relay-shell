import {describe, expect, it} from 'vitest';
import {parseCliOptions} from '../src/cli/options.js';

describe('CLI options', () => {
  it('reads the demonstration flags', () => {
    expect(parseCliOptions(['--demo', '--inline'])).toMatchObject({
      demo: true,
      inline: true,
      snapshot: false,
    });
  });

  it('rejects unknown options', () => {
    expect(() => parseCliOptions(['--wat'])).toThrow('Unknown option');
  });
});
