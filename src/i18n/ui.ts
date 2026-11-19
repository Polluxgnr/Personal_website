import type { Localized } from '../lib/schema.ts';

export const languages = ['en', 'fr'] as const;
export type Lang = (typeof languages)[number];

const strings = {
  en: {
    'meta.title': 'Pollux Gronier, AI and data science student',
    'meta.description':
      'Projects, experience and CV of Pollux Gronier, AI and data science student at CentraleSupélec and ESSEC.',
    'nav.skip': 'Skip to content',
    'nav.label': 'Main',
    'nav.menu': 'Menu',
    'nav.home': 'Home',
    'nav.projects': 'Projects',
    'nav.background': 'About me',
    'nav.contact': 'Contact',
    'nav.cv': 'CV',
    'nav.switch': 'Français',
    'nav.switchLabel': 'Lire en français',
    'hero.cv': 'Download my CV',
    'hero.contact': 'Get in touch',
    'hero.now': 'Right now:',
    'hero.photo': 'Pollux Gronier on a felucca on the Nile at sunset.',
    'home.projects': 'Things I’ve built',
    'home.allProjects': 'See all {n} projects',
    'home.experience': 'What I’ve been up to',
    'home.background': 'More about me',
    'home.contactTitle': 'Recruiting for an internship?',
    'home.contactBody':
      'Tell me about the role. The form sends your message straight to my inbox, and I reply within two days.',
    'graph.title': 'What I built, and what it took',
    'graph.hint': 'Point at a project or a skill to see how they connect.',
    'graph.desc':
      'Each line links a project on the left to a skill it uses on the right. The same information is in the project list below.',
    'projects.title': 'Projects',
    'projects.description':
      'Data, AI and finance projects by Pollux Gronier, with the question each one answers and the code behind it.',
    'work.filter': 'Show projects using',
    'work.all': 'Everything',
    'work.more': 'More projects',
    'work.code': 'Code',
    'work.live': 'Live app',
    'work.details': 'See how it works',
    'work.updated': 'Updated',
    'work.empty': 'No project uses this skill yet. Give me a few weeks. Or pick another one.',
    'bg.title': 'About me',
    'bg.path': 'How I got here',
    'bg.description':
      'Experience, associations, education and skills of Pollux Gronier, AI and data science student.',
    'exp.title': 'Experience',
    'about.work': 'Where I’ve worked',
    'about.assoc': 'Clubs and competitions',
    'about.edu': 'Where I studied',
    'assoc.title': 'Associations and competitions',
    'edu.title': 'Education',
    'about.skills': 'Tools I use',
    'about.languages': 'Languages',
    'about.interests': 'Outside work',
    'contact.title': 'Contact',
    'contact.description': 'Send Pollux Gronier a message about an internship or a project.',
    'contact.lede':
      'Write to me here and the message goes straight to my inbox. I usually reply within two days.',
    'contact.joke': 'No chatbot, no auto-reply: a real person (me) answers.',
    'contact.name': 'Your name',
    'contact.email': 'Your email',
    'contact.company': 'Company or school (optional)',
    'contact.message': 'Message',
    'contact.send': 'Send message',
    'contact.sending': 'Sending…',
    'contact.sent': 'Message sent. I will reply to the email address you gave.',
    'contact.error':
      'The message was not sent. Check your connection and try again, or write to me on LinkedIn.',
    'contact.invalid': 'Fill in your name, a valid email and a message of at least 10 characters.',
    'contact.offline':
      'The form is not connected yet, so this message was not sent. You can reach me on LinkedIn meanwhile.',
    'contact.elsewhere': 'You can also find me on',
    'project.back': 'All projects',
    'project.why': 'Why I built it',
    'project.how': 'Under the hood',
    'project.what': 'What it does',
    'project.highlights': 'Worth a look',
    'project.stack': 'Built with',
    'project.aiNote':
      'This summary was written by an AI from the repository README and reviewed before publishing.',
    'footer.source': 'Source code of this site',
    'footer.privacy': 'Privacy',
    'footer.built': 'Built with Astro, deployed by GitHub Actions.',
    'cv.download': 'Download PDF',
    'cv.contact': 'Contact through polluxgronier.me',
    'cv.selected': 'Selected projects',
    'cv.skills': 'Skills',
    'notfound.title': 'Page not found',
    'notfound.body':
      'This address doesn’t exist. Unlike me: I’m easy to reach, and looking for an internship.',
    'notfound.home': 'Go to the home page',
  },
  fr: {
    'meta.title': 'Pollux Gronier, étudiant en IA et data science',
    'meta.description':
      'Projets, expériences et CV de Pollux Gronier, étudiant en IA et data science à CentraleSupélec et à l’ESSEC.',
    'nav.skip': 'Aller au contenu',
    'nav.label': 'Principale',
    'nav.menu': 'Menu',
    'nav.home': 'Accueil',
    'nav.projects': 'Projets',
    'nav.background': 'À propos',
    'nav.contact': 'Contact',
    'nav.cv': 'CV',
    'nav.switch': 'English',
    'nav.switchLabel': 'Read in English',
    'hero.cv': 'Télécharger mon CV',
    'hero.contact': 'Me contacter',
    'hero.now': 'En ce moment :',
    'hero.photo': 'Pollux Gronier sur une felouque sur le Nil, au coucher du soleil.',
    'home.projects': 'Ce que j’ai construit',
    'home.allProjects': 'Voir les {n} projets',
    'home.experience': 'Ce que j’ai fait récemment',
    'home.background': 'En savoir plus sur moi',
    'home.contactTitle': 'Vous recrutez un stagiaire ?',
    'home.contactBody':
      'Parlez-moi du poste. Le formulaire envoie votre message directement dans ma boîte, et je réponds sous deux jours.',
    'graph.title': 'Ce que j’ai construit, et avec quoi',
    'graph.hint': 'Survolez un projet ou une compétence pour voir les liens.',
    'graph.desc':
      'Chaque trait relie un projet, à gauche, à une compétence qu’il utilise, à droite. Les mêmes informations figurent dans la liste des projets plus bas.',
    'projects.title': 'Projets',
    'projects.description':
      'Projets data, IA et finance de Pollux Gronier : la question à laquelle chacun répond, et le code.',
    'work.filter': 'Projets qui utilisent',
    'work.all': 'Tout',
    'work.more': 'Autres projets',
    'work.code': 'Code',
    'work.live': 'Application',
    'work.details': 'Comment ça marche',
    'work.updated': 'Mis à jour',
    'work.empty':
      'Aucun projet n’utilise encore cette compétence. Laissez-moi quelques semaines. Ou choisissez-en une autre.',
    'bg.title': 'À propos',
    'bg.path': 'Comment j’en suis arrivé là',
    'bg.description':
      'Expériences, associations, formation et compétences de Pollux Gronier, étudiant en IA et data science.',
    'exp.title': 'Expériences',
    'about.work': 'Où j’ai travaillé',
    'about.assoc': 'Clubs et compétitions',
    'about.edu': 'Où j’ai étudié',
    'assoc.title': 'Associations et compétitions',
    'edu.title': 'Formation',
    'about.skills': 'Mes outils',
    'about.languages': 'Langues',
    'about.interests': 'En dehors du travail',
    'contact.title': 'Contact',
    'contact.description': 'Écrire à Pollux Gronier pour un stage ou un projet.',
    'contact.lede':
      'Écrivez-moi ici, le message arrive directement dans ma boîte. Je réponds en général sous deux jours.',
    'contact.joke': 'Pas de chatbot, pas de réponse automatique : c’est moi qui réponds.',
    'contact.name': 'Votre nom',
    'contact.email': 'Votre e-mail',
    'contact.company': 'Entreprise ou école (facultatif)',
    'contact.message': 'Message',
    'contact.send': 'Envoyer le message',
    'contact.sending': 'Envoi…',
    'contact.sent': 'Message envoyé. Je répondrai à l’adresse e-mail indiquée.',
    'contact.error':
      'Le message n’est pas parti. Vérifiez votre connexion et réessayez, ou écrivez-moi sur LinkedIn.',
    'contact.invalid':
      'Indiquez votre nom, un e-mail valide et un message d’au moins 10 caractères.',
    'contact.offline':
      'Le formulaire n’est pas encore branché, ce message n’est donc pas parti. Vous pouvez me joindre sur LinkedIn en attendant.',
    'contact.elsewhere': 'Vous me trouverez aussi sur',
    'project.back': 'Tous les projets',
    'project.why': 'Pourquoi je l’ai construit',
    'project.how': 'Sous le capot',
    'project.what': 'Ce que fait le projet',
    'project.highlights': 'À regarder',
    'project.stack': 'Outils',
    'project.aiNote':
      'Ce résumé a été rédigé par une IA à partir du README du dépôt, puis relu avant publication.',
    'footer.source': 'Code source de ce site',
    'footer.privacy': 'Confidentialité',
    'footer.built': 'Construit avec Astro, déployé par GitHub Actions.',
    'cv.download': 'Télécharger le PDF',
    'cv.contact': 'Contact via polluxgronier.me',
    'cv.selected': 'Projets choisis',
    'cv.skills': 'Compétences',
    'notfound.title': 'Page introuvable',
    'notfound.body':
      'Cette adresse n’existe pas. Contrairement à moi : facile à joindre, et à la recherche d’un stage.',
    'notfound.home': 'Aller à l’accueil',
  },
} as const satisfies Record<Lang, Record<string, string>>;

export type UiKey = keyof (typeof strings)['en'];

export const useTranslations =
  (lang: Lang) =>
  (key: UiKey, vars: Record<string, string | number> = {}) =>
    Object.entries(vars).reduce<string>(
      (text, [name, value]) => text.replace(`{${name}}`, String(value)),
      strings[lang][key],
    );

/** Picks the right language from a `{ en, fr }` value. */
export const pick = (value: Localized, lang: Lang) => value[lang];

/** French names for the skill nodes; English names are the keys used in projects.json. */
const skillNamesFr: Record<string, string> = {
  'Data engineering': 'Ingénierie des données',
  'Time series & econometrics': 'Économétrie',
  Finance: 'Finance',
  'NLP & LLMs': 'NLP et LLM',
  'Web & apps': 'Web et applis',
  'Machine learning': 'Machine learning',
  'Optimisation & simulation': 'Optimisation et simulation',
  Graphs: 'Graphes',
};

export const skillName = (skill: string, lang: Lang) =>
  lang === 'fr' ? (skillNamesFr[skill] ?? skill) : skill;

/** Path of a page in a given language. `path` is the English path, starting with `/`. */
export const localizePath = (path: string, lang: Lang) =>
  lang === 'en' ? path : `/fr${path === '/' ? '/' : path}`;

export const otherLang = (lang: Lang): Lang => (lang === 'en' ? 'fr' : 'en');
