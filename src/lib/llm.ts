/**
 * Helpers for talking to free models on OpenRouter. Free models come and go,
 * so the sync script lists what is free at run time, ranks it with these pure
 * functions, and validates whatever a model answers.
 */

export interface OpenRouterModel {
  id: string;
  context_length?: number;
  pricing?: { prompt?: string; completion?: string };
  supported_parameters?: string[];
}

/** Larger, multilingual models first: the cards are written in English and French. */
export const PREFERRED_FREE_MODELS = [
  'google/gemma-4-31b-it:free',
  'nvidia/nemotron-3-ultra-550b-a55b:free',
  'nvidia/nemotron-3.5-super-vl:free',
  'google/gemma-4-26b-a4b-it:free',
  'baidu/ernie-5.5-flash-preview:free',
  'inclusionai/ling-3.2-flash:free',
];

const UNSUITABLE = /code|embed|1\.7b|tiny|nano/i;

export function isFree(model: OpenRouterModel): boolean {
  return (
    model.id.endsWith(':free') &&
    Number(model.pricing?.prompt ?? 1) === 0 &&
    Number(model.pricing?.completion ?? 1) === 0
  );
}

/** Free, roomy enough for a README, and not a code or tiny model; preferred ones first. */
export function rankFreeModels(
  models: readonly OpenRouterModel[],
  preferred: readonly string[] = PREFERRED_FREE_MODELS,
  limit = 4,
): OpenRouterModel[] {
  const usable = models.filter(
    (m) => isFree(m) && (m.context_length ?? 0) >= 32_000 && !UNSUITABLE.test(m.id),
  );
  const rank = (m: OpenRouterModel) => {
    const i = preferred.indexOf(m.id);
    return i === -1 ? preferred.length : i;
  };
  return usable
    .toSorted((a, b) => rank(a) - rank(b) || (b.context_length ?? 0) - (a.context_length ?? 0))
    .slice(0, limit);
}

/** Reads the JSON object out of a model's answer, even inside a code fence or after some prose. */
export function extractJson(text: string): unknown {
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(text)?.[1];
  const candidate = fenced ?? text;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end <= start) throw new Error('The answer contains no JSON object.');
  return JSON.parse(candidate.slice(start, end + 1));
}
