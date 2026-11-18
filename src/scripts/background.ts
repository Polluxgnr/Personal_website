/**
 * Interactive background: a quiet dot grid on a canvas behind the page.
 *  - dots near the pointer swell, light up in the accent colour and lean away from it;
 *  - a click sends a ripple through the grid;
 *  - on touch screens (no pointer) a soft light drifts through on its own;
 *  - with prefers-reduced-motion it is a still grid, drawn once.
 * It reads its colours from the page's CSS variables, so it follows the tint switcher.
 * The loop sleeps whenever nothing moves or the tab is hidden.
 */

const canvas = document.querySelector<HTMLCanvasElement>('[data-bg]');
const ctx = canvas?.getContext('2d');

if (canvas && ctx) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(pointer: coarse)');
  const SPACING = 36;
  const REACH = 170;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let cols = 0;
  let rows = 0;
  let ink = '#ffffff';
  let accent = '#ff5a1f';
  const pointer = { x: -9999, y: -9999, active: false };
  const ripples: { x: number; y: number; t: number }[] = [];
  let running = false;
  let lastMove = 0;
  let last = 0;

  /** Turns any CSS colour into an "r, g, b" string the canvas can use with its own alpha. */
  const rgb = (value: string, fallback: string) => {
    ctx.fillStyle = fallback;
    ctx.fillStyle = value;
    const hex = ctx.fillStyle;
    const n = parseInt(hex.slice(1), 16);
    return Number.isNaN(n) ? '255,255,255' : `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
  };

  const readColours = () => {
    const css = getComputedStyle(document.documentElement);
    ink = rgb(css.getPropertyValue('--ink').trim(), '#ffffff');
    accent = rgb(css.getPropertyValue('--accent').trim(), '#ff5a1f');
  };

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    cols = Math.ceil(width / SPACING) + 1;
    rows = Math.ceil(height / SPACING) + 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(performance.now());
  };

  const draw = (now: number) => {
    ctx.clearRect(0, 0, width, height);
    // The ambient light on touch screens: a slow Lissajous path.
    if (coarse.matches && !reduce.matches) {
      pointer.x = width * (0.5 + 0.38 * Math.sin(now / 4200));
      pointer.y = height * (0.45 + 0.32 * Math.sin(now / 3100 + 1));
      pointer.active = true;
    }
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const bx = i * SPACING;
        const by = j * SPACING;
        let x = bx;
        let y = by;
        let near = 0;
        if (pointer.active) {
          const dx = bx - pointer.x;
          const dy = by - pointer.y;
          const d = Math.hypot(dx, dy);
          if (d < REACH) {
            near = 1 - d / REACH;
            const push = near * near * 14;
            x += (dx / (d || 1)) * push;
            y += (dy / (d || 1)) * push;
          }
        }
        let wave = 0;
        for (const r of ripples) {
          const radius = (now - r.t) * 0.55;
          const d = Math.hypot(bx - r.x, by - r.y);
          const edge = Math.abs(d - radius);
          if (edge < 60)
            wave = Math.max(wave, (1 - edge / 60) * Math.max(0, 1 - (now - r.t) / 1400));
        }
        const glow = Math.max(near, wave);
        const radius = 1.1 + near * 2.4 + wave * 2.2;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = glow > 0.02 ? `rgba(${accent},${0.25 + glow * 0.75})` : `rgba(${ink},0.16)`;
        ctx.fill();
      }
    }
  };

  const frame = (now: number) => {
    // Cap at about 40 fps: plenty for a background, kind to batteries.
    if (now - last < 24) {
      requestAnimationFrame(frame);
      return;
    }
    last = now;
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i];
      if (r && now - r.t > 1400) ripples.splice(i, 1);
    }
    draw(now);
    const idle = !coarse.matches && ripples.length === 0 && now - lastMove > 900;
    if (idle || document.hidden) {
      running = false;
      return;
    }
    requestAnimationFrame(frame);
  };

  const wake = () => {
    lastMove = performance.now();
    if (!running && !reduce.matches) {
      running = true;
      requestAnimationFrame(frame);
    }
  };

  readColours();
  resize();
  addEventListener('resize', resize);

  // Follow the tint switcher.
  new MutationObserver(() => {
    readColours();
    draw(performance.now());
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  if (!reduce.matches) {
    addEventListener('pointermove', (event) => {
      if (event.pointerType === 'touch') return;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
      wake();
    });
    document.addEventListener('pointerleave', () => {
      pointer.active = false;
      wake();
    });
    addEventListener('pointerdown', (event) => {
      ripples.push({ x: event.clientX, y: event.clientY, t: performance.now() });
      wake();
    });
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) wake();
    });
    if (coarse.matches) wake();
  }
}
