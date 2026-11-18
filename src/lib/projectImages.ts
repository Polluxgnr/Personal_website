import type { ImageMetadata } from 'astro';
import shockgraph from '../assets/projects/shockgraph-pea.png';
import cinegraph from '../assets/projects/cinegraph.png';
import uc3m from '../assets/projects/uc3m-course-planner.png';
import nuclear from '../assets/projects/nuclear-capital-risk.png';
import climate from '../assets/projects/climate-stripes.png';
import assistant from '../assets/projects/application-assistant.png';
import type { Localized } from './schema.ts';

export interface ProjectImage {
  src: ImageMetadata;
  alt: Localized;
  /** White figures are dimmed slightly so they sit in the dark page. */
  light: boolean;
}

/** Pictures taken from each project itself: its figures, diagrams or live interface. */
export const projectImages: Record<string, ProjectImage> = {
  'shockgraph-pea': {
    src: shockgraph,
    light: true,
    alt: {
      en: 'ShockGraph graph schema: funds, indexes, companies, sectors, countries and factors, with each link labelled by its truth level.',
      fr: 'Schéma du graphe ShockGraph : fonds, indices, entreprises, secteurs, pays et facteurs, chaque lien étiqueté selon son niveau de vérité.',
    },
  },
  cinegraph: {
    src: cinegraph,
    light: false,
    alt: {
      en: 'CineGraph home screen: “What are we watching?” with a free-text request box and suggested queries.',
      fr: 'Écran d’accueil de CineGraph : « What are we watching? » avec un champ de demande libre et des suggestions.',
    },
  },
  'uc3m-course-planner': {
    src: uc3m,
    light: false,
    alt: {
      en: 'UC3M Course Planner: the catalogue of courses next to a course map plotting maths load against hands-on work.',
      fr: 'UC3M Course Planner : le catalogue des cours à côté d’une carte qui croise charge en maths et travail pratique.',
    },
  },
  'nuclear-capital-risk': {
    src: nuclear,
    light: true,
    alt: {
      en: 'Two world maps of nuclear reactors: the 2026 fleet, and what remains in 2035 if reactors past 40 years are not extended.',
      fr: 'Deux cartes du monde des réacteurs nucléaires : la flotte en 2026, et ce qu’il en reste en 2035 sans prolongation au-delà de 40 ans.',
    },
  },
  'Environemental-economics-': {
    src: climate,
    light: true,
    alt: {
      en: 'Climate stripes for 12 countries, 1940 to 2025: every country has been warmer than its 1961–1990 normal every year since 2016.',
      fr: 'Bandes climatiques de 12 pays, de 1940 à 2025 : chaque pays est plus chaud que sa normale 1961-1990 chaque année depuis 2016.',
    },
  },
  'application-assistant': {
    src: assistant,
    light: false,
    alt: {
      en: 'The Application Assistant n8n workflow: Discord router, analyser and generator sub-workflows.',
      fr: 'Le workflow n8n d’Application Assistant : routeur Discord, sous-workflows d’analyse et de génération.',
    },
  },
};
