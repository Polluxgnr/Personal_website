import { describe, expect, it } from 'vitest';
import { extractJson, isFree, rankFreeModels, type OpenRouterModel } from '../../src/lib/llm.ts';

const model = (id: string, context = 128_000, price = '0'): OpenRouterModel => ({
  id,
  context_length: context,
  pricing: { prompt: price, completion: price },
});

describe('rankFreeModels', () => {
  it('keeps only free, roomy, non-code models and puts preferred ones first', () => {
    const ranked = rankFreeModels(
      [
        model('some/small:free', 8_000),
        model('paid/model', 200_000, '0.001'),
        model('vendor/code-helper:free', 256_000),
        model('vendor/other:free', 500_000),
        model('google/gemma-4-31b-it:free', 262_144),
      ],
      ['google/gemma-4-31b-it:free'],
    );
    expect(ranked.map((m) => m.id)).toEqual(['google/gemma-4-31b-it:free', 'vendor/other:free']);
  });

  it('never returns more than the limit', () => {
    const many = Array.from({ length: 10 }, (_, i) => model(`v/m${i}:free`));
    expect(rankFreeModels(many, [], 3)).toHaveLength(3);
  });

  it('does not treat a missing price as free', () => {
    expect(isFree({ id: 'x:free' })).toBe(false);
  });
});

describe('extractJson', () => {
  it('reads plain JSON, fenced JSON and JSON after prose', () => {
    expect(extractJson('{"a":1}')).toEqual({ a: 1 });
    expect(extractJson('```json\n{"a":2}\n```')).toEqual({ a: 2 });
    expect(extractJson('Sure! Here is the card: {"a":3} Hope that helps.')).toEqual({ a: 3 });
  });

  it('throws when there is no object', () => {
    expect(() => extractJson('no json here')).toThrow();
  });
});
