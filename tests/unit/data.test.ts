import { describe, expect, it } from 'vitest';
import { featuredProjects, profile, projects, skills } from '../../src/lib/data.ts';
import { formatRange } from '../../src/lib/dates.ts';

describe('site data', () => {
  it('validates and has something to show', () => {
    expect(projects.length).toBeGreaterThan(0);
    expect(featuredProjects.length).toBeGreaterThanOrEqual(4);
    expect(skills.length).toBeGreaterThan(0);
  });

  it('never publishes a phone number or email address', () => {
    const text = JSON.stringify({ profile, projects });
    expect(text).not.toMatch(/[\w.+-]+@[a-z0-9-]+\.[a-z]{2,}/i);
    expect(text).not.toMatch(/(\+33|\b0)[\s.]?[67](?:[\s.]?\d{2}){4}/);
  });

  it('links every project to an existing skill node', () => {
    for (const p of projects) for (const s of p.skills) expect(skills).toContain(s);
  });
});

describe('formatRange', () => {
  it('formats ranges, single months and unknown dates', () => {
    expect(formatRange('2026-05', '2026-08', 'en')).toBe('May 2026 – Aug 2026');
    expect(formatRange('2025-03', '2025-03', 'en')).toBe('Mar 2025');
    expect(formatRange('2024', '2028', 'fr')).toBe('2024 – 2028');
    expect(formatRange('2024', undefined, 'en')).toBe('2024 – now');
    expect(formatRange(undefined, undefined, 'en')).toBe('');
  });
});
