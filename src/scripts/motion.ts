/**
 * The motion layer (Motion, motion.dev). Transform, opacity and clip-path only.
 * An inline script in <head> adds `motion-ready` to <html> before first paint
 * (so revealed parts start hidden without a flash) and removes it again if
 * this module has not started within three seconds, so content can never
 * stay hidden. With prefers-reduced-motion, none of this runs.
 */
import { animate, inView, scroll, stagger } from 'motion';

const ease = [0.16, 1, 0.3, 1] as const;
const root = document.documentElement;
(window as { __motion?: boolean }).__motion = true;

// A small hello for anyone who opens the console.
console.log(
  '%cHello, fellow source-reader.%c The code is public: github.com/Polluxgnr/Personal_website. If you got this far, you are my kind of recruiter. Say hi at polluxgronier.me/contact/',
  'font: 700 15px sans-serif; color: #ff5a1f',
  'font: 14px sans-serif',
);

/** Wraps each word of a heading so it can rise from behind its own line. Screen readers keep the plain text. */
function splitWords(el: HTMLElement) {
  const text = el.textContent?.trim() ?? '';
  el.setAttribute('aria-label', text);
  el.textContent = '';
  for (const word of text.split(/\s+/)) {
    const outer = document.createElement('span');
    outer.className = 'w';
    outer.setAttribute('aria-hidden', 'true');
    const inner = document.createElement('span');
    inner.textContent = word;
    outer.append(inner);
    el.append(outer, ' ');
  }
}

if (root.classList.contains('motion-ready')) {
  // Reading progress bar.
  const progress = document.querySelector('[data-progress]');
  if (progress) scroll(animate(progress, { scaleX: [0, 1] }, { ease: 'linear' }));

  // Hero: the name rises line by line, the photo opens from the bottom, the rest fades up.
  const lines = document.querySelectorAll('[data-hero] .line > span');
  if (lines.length) {
    animate(lines, { y: ['110%', '0%'] }, { duration: 0.6, delay: stagger(0.08), ease });
    animate(
      document.querySelectorAll('[data-hero-fade]'),
      { opacity: [0, 1], y: [18, 0] },
      { duration: 0.5, delay: stagger(0.05, { startDelay: 0.15 }), ease },
    );
  }
  const photo = document.querySelector<HTMLElement>('[data-hero-photo]');
  const picture = photo?.querySelector('img');
  if (photo && picture) {
    animate(
      photo,
      { clipPath: ['inset(100% 0 0 0 round 1.5rem)', 'inset(0% 0 0 0 round 1.5rem)'] },
      { duration: 0.8, delay: 0.05, ease },
    );
    animate(picture, { scale: [1.25, 1.08] }, { duration: 1.1, delay: 0.05, ease });
    // Then it drifts inside its frame as the page scrolls.
    scroll(animate(picture, { y: ['-4%', '6%'] }, { ease: 'linear' }), {
      target: photo,
      offset: ['start end', 'end start'],
    });
  }

  // Headings: word by word.
  for (const heading of document.querySelectorAll<HTMLElement>('[data-words]')) {
    splitWords(heading);
    inView(
      heading,
      () => {
        animate(
          heading.querySelectorAll('.w > span'),
          { y: ['110%', '0%'] },
          { duration: 0.5, delay: stagger(0.03), ease },
        );
      },
      { amount: 0.4 },
    );
  }

  // Every group's parts enter once, staggered.
  inView(
    '[data-reveal-group]',
    (group) => {
      animate(
        group.querySelectorAll('[data-reveal]'),
        { opacity: [0, 1], y: [20, 0] },
        // Capped, so a long list never makes you wait for its last row.
        { duration: 0.5, delay: (i: number) => Math.min(i * 0.05, 0.25), ease },
      );
    },
    { amount: 0.08 },
  );

  // Flows (how a project works, my path): the rail fills as you scroll and each step lights up.
  for (const flow of document.querySelectorAll<HTMLElement>('[data-flow]')) {
    const fill = flow.querySelector('[data-flow-fill]');
    if (fill) {
      scroll(animate(fill, { scaleY: [0, 1] }, { ease: 'linear' }), {
        target: flow,
        offset: ['start 70%', 'end 60%'],
      });
    }
    for (const step of flow.querySelectorAll<HTMLElement>('[data-flow-step]')) {
      inView(step, () => step.setAttribute('data-lit', ''), { margin: '0px 0px -30% 0px' });
    }
  }

  // Numbers count up when they come into view.
  for (const el of document.querySelectorAll<HTMLElement>('[data-count]')) {
    const target = Number(el.dataset.count);
    if (!Number.isFinite(target)) continue;
    const format = new Intl.NumberFormat(el.dataset.locale === 'fr' ? 'fr-FR' : 'en-GB');
    el.textContent = format.format(0);
    inView(
      el,
      () => {
        animate(0, target, {
          duration: 1.2,
          ease,
          onUpdate: (value) => {
            el.textContent = format.format(Math.round(value));
          },
        });
      },
      { amount: 0.8 },
    );
  }

  // Magnetic buttons lean toward the pointer and spring back.
  for (const el of document.querySelectorAll<HTMLElement>('[data-magnetic]')) {
    el.addEventListener('pointermove', (event) => {
      if (event.pointerType !== 'mouse') return;
      const box = el.getBoundingClientRect();
      const x = (event.clientX - (box.left + box.width / 2)) * 0.3;
      const y = (event.clientY - (box.top + box.height / 2)) * 0.3;
      animate(el, { x, y }, { type: 'spring', stiffness: 300, damping: 20 });
    });
    el.addEventListener('pointerleave', () => {
      animate(el, { x: 0, y: 0 }, { type: 'spring', stiffness: 250, damping: 14 });
    });
  }
}
