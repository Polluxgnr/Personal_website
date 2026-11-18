import { describe, expect, it } from 'vitest';
import { applyAction, planSync, type RepoInfo } from '../../src/lib/sync.ts';
import { Project, type Project as P } from '../../src/lib/schema.ts';

const repo = (name: string, extra: Partial<RepoInfo> = {}): RepoInfo => ({
  name,
  private: false,
  fork: false,
  archived: false,
  pushed_at: '2026-11-01T10:00:00Z',
  homepage: null,
  description: null,
  ...extra,
});

const project = (name: string, extra: Partial<P> = {}): P =>
  Project.parse({
    repo: name,
    title: name,
    question: { en: 'Q?', fr: 'Q ?' },
    summary: { en: 'S.', fr: 'S.' },
    highlights: [],
    stack: ['Python'],
    skills: ['Graphs'],
    category: 'data',
    featured: true,
    order: 3,
    pushedAt: '2026-10-01',
    source: 'manual',
    ...extra,
  });

const generated = {
  title: 'New',
  question: { en: 'Why?', fr: 'Pourquoi ?' },
  summary: { en: 'Because.', fr: 'Parce que.' },
  highlights: [],
  stack: ['Python'],
  skills: ['Graphs'],
  category: 'ai' as const,
};

describe('planSync', () => {
  it('creates new repos and skips forks, private, archived and excluded ones', () => {
    const plan = planSync(
      [],
      [
        repo('new'),
        repo('f', { fork: true }),
        repo('p', { private: true }),
        repo('old', { archived: true }),
        repo('lab2'),
      ],
      () => 'sha',
    );
    expect(plan.actions.map((a) => [a.kind, a.repo.name])).toEqual([['create', 'new']]);
  });

  it('rewrites only when the README changed', () => {
    const current = [project('same', { readmeSha: 'a' }), project('changed', { readmeSha: 'a' })];
    const plan = planSync(current, [repo('same'), repo('changed')], (n) =>
      n === 'same' ? 'a' : 'b',
    );
    expect(plan.actions.map((a) => a.kind)).toEqual(['refresh', 'rewrite']);
  });

  it('never rewrites a locked entry', () => {
    const plan = planSync([project('x', { readmeSha: 'a', locked: true })], [repo('x')], () => 'b');
    expect(plan.actions[0]!.kind).toBe('refresh');
  });

  it('adopts hand-written entries without rewriting them', () => {
    const plan = planSync([project('x')], [repo('x')], () => 'b');
    expect(plan.actions[0]!.kind).toBe('refresh');
    const next = applyAction(plan.actions[0]!, undefined, 'b', 0);
    expect(next.readmeSha).toBe('b');
    expect(next.summary).toEqual(project('x').summary);
  });

  it('reports entries whose repository disappeared', () => {
    const plan = planSync([project('gone')], [], () => undefined);
    expect(plan.removed.map((p) => p.repo)).toEqual(['gone']);
  });
});

describe('applyAction', () => {
  it('keeps featured and order when rewriting, and marks the text as AI-written', () => {
    const current = project('x', { readmeSha: 'a', featured: true, order: 2 });
    const next = applyAction({ kind: 'rewrite', repo: repo('x'), current }, generated, 'b', 99);
    expect(next).toMatchObject({
      featured: true,
      order: 2,
      source: 'ai',
      readmeSha: 'b',
      pushedAt: '2026-11-01',
    });
    expect(Project.safeParse(next).success).toBe(true);
  });

  it('adds new projects unfeatured at the end', () => {
    const next = applyAction(
      { kind: 'create', repo: repo('n', { homepage: 'https://x.dev/' }) },
      generated,
      's',
      42,
    );
    expect(next).toMatchObject({ featured: false, order: 42, homepage: 'https://x.dev/' });
  });

  it('refuses to create a card without text', () => {
    expect(() => applyAction({ kind: 'create', repo: repo('n') }, undefined, 's', 1)).toThrow();
  });
});
