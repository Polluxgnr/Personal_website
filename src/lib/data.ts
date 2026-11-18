import profileJson from '../data/profile.json';
import projectsJson from '../data/projects.json';
import { Profile, Projects, type Project } from './schema.ts';

/**
 * Data is validated when the site builds: a typo in profile.json or a bad
 * entry written by the AI sync fails the build instead of shipping.
 */
export const profile = Profile.parse(profileJson);

export const projects: readonly Project[] = Projects.parse(projectsJson).toSorted(
  (a, b) => a.order - b.order || a.title.localeCompare(b.title),
);

export const featuredProjects = projects.filter((p) => p.featured);
export const otherProjects = projects.filter((p) => !p.featured);

/** Skills in order of how many projects use them, then alphabetically. */
export const skills: readonly string[] = (() => {
  const count = new Map<string, number>();
  for (const p of projects) for (const s of p.skills) count.set(s, (count.get(s) ?? 0) + 1);
  return [...count.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([s]) => s);
})();

export const repoUrl = (p: Pick<Project, 'repo'>) => `${profile.links.github}/${p.repo}`;

/** Stable, URL- and attribute-safe id for a skill name. */
export const skillId = (skill: string) =>
  skill
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
