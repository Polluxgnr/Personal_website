export type ContactResult = 'ok' | 'invalid' | 'error';

/**
 * Sends the contact form to Web3Forms as JSON and maps its answer to a
 * message the page can show. Never throws: network failures become 'error'.
 */
export async function submitContact(
  endpoint: string,
  data: FormData,
  fetchImpl: typeof fetch = fetch,
  timeoutMs = 15_000,
): Promise<ContactResult> {
  const body = Object.fromEntries(
    [...data.entries()].filter(
      // `redirect` is only for plain form posts without JavaScript.
      (entry): entry is [string, string] => typeof entry[1] === 'string' && entry[0] !== 'redirect',
    ),
  );
  try {
    const response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
    const result = (await response.json().catch(() => ({}))) as { success?: boolean };
    if (response.ok && result.success === true) return 'ok';
    if (response.status === 400 || response.status === 422) return 'invalid';
    return 'error';
  } catch {
    return 'error';
  }
}
