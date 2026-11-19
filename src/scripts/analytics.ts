/**
 * Sends one cookie-free page view to GoatCounter, when a site code is set.
 * Nothing is sent from localhost, from browsers that ask not to be tracked
 * ("Do Not Track"), or from obvious bots. The page's privacy notice says so.
 */
import { sourceFrom, statsUrl, validCode } from '../lib/stats.ts';

const code = document.body.dataset.stats;
const doNotTrack =
  navigator.doNotTrack === '1' || (window as { doNotTrack?: string }).doNotTrack === '1';
const local = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
const bot = /bot|crawl|spider|headless/i.test(navigator.userAgent);

if (validCode(code) && !doNotTrack && !local && !bot) {
  const url = statsUrl(code, {
    path: location.pathname,
    title: document.title,
    source: sourceFrom(location.search, document.referrer, location.hostname),
    nonce: Math.random().toString(36).slice(2, 10),
  });
  // A "no-cors" request is enough: the answer is a 1x1 image nobody needs to read.
  void fetch(url, {
    mode: 'no-cors',
    credentials: 'omit',
    keepalive: true,
    referrerPolicy: 'no-referrer',
  }).catch(() => undefined);
}
