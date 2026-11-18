import { describe, expect, it } from 'vitest';
import { submitContact } from '../../src/lib/contact-client.ts';

const form = () => {
  const data = new FormData();
  data.set('access_key', 'public-key');
  data.set('name', 'Ada');
  data.set('message', 'Hello there, Pollux');
  data.set('redirect', 'https://polluxgronier.me/contact/?sent=1');
  return data;
};
const reply = (status: number, body: unknown) =>
  (async () => new Response(JSON.stringify(body), { status })) as typeof fetch;

describe('submitContact', () => {
  it('maps Web3Forms answers to messages', async () => {
    expect(await submitContact('https://w', form(), reply(200, { success: true }))).toBe('ok');
    expect(await submitContact('https://w', form(), reply(200, { success: false }))).toBe('error');
    expect(await submitContact('https://w', form(), reply(400, { success: false }))).toBe(
      'invalid',
    );
    expect(await submitContact('https://w', form(), reply(500, {}))).toBe('error');
  });

  it('turns network failures and non-JSON answers into an error instead of throwing', async () => {
    const failing = (async () => {
      throw new TypeError('offline');
    }) as typeof fetch;
    expect(await submitContact('https://w', form(), failing)).toBe('error');
    const html = (async () => new Response('<html>', { status: 502 })) as typeof fetch;
    expect(await submitContact('https://w', form(), html)).toBe('error');
  });

  it('sends the fields as JSON, without the no-JavaScript redirect', async () => {
    let body = '';
    const capture = (async (_url: unknown, init?: RequestInit) => {
      body = String(init?.body);
      return new Response(JSON.stringify({ success: true }));
    }) as typeof fetch;
    await submitContact('https://w', form(), capture);
    expect(JSON.parse(body)).toEqual({
      access_key: 'public-key',
      name: 'Ada',
      message: 'Hello there, Pollux',
    });
  });
});
