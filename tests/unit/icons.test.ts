import { describe, expect, it } from 'vitest';
import { toolIcon } from '../../src/lib/icons.ts';
import { featuredProjects, profile, projects } from '../../src/lib/data.ts';

describe('toolIcon', () => {
  it('returns an SVG path for known tools and nothing for unknown ones', () => {
    expect(toolIcon('Python')?.path.length).toBeGreaterThan(20);
    expect(toolIcon('Definitely not a tool')).toBeUndefined();
  });
});

describe('project and profile content', () => {
  it('explains why every project exists, with 2 to 7 architecture steps where given', () => {
    for (const p of projects) {
      expect(p.why, `${p.repo} has no why`).toBeDefined();
      if (p.architecture) {
        expect(p.architecture.length).toBeGreaterThanOrEqual(2);
        expect(p.architecture.length).toBeLessThanOrEqual(7);
      }
    }
  });

  it('gives every featured project an architecture', () => {
    for (const p of featuredProjects) expect(p.architecture, p.repo).toBeDefined();
  });

  it('has a path with both languages for every stop', () => {
    expect(profile.journey.length).toBeGreaterThanOrEqual(4);
    for (const j of profile.journey) {
      expect(j.title.fr.length).toBeGreaterThan(0);
      expect(j.text.en.length).toBeGreaterThan(20);
    }
  });
});
