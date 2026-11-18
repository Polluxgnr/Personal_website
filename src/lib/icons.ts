/**
 * Tool logos come from Simple Icons (CC0) and are resolved at build time:
 * nothing from this package ships to the browser except the SVG path of an
 * icon that a page actually uses. A tool with no logo is shown as text only.
 */
import * as icons from 'simple-icons';

const keys: Record<string, string> = {
  Python: 'siPython',
  JavaScript: 'siJavascript',
  TypeScript: 'siTypescript',
  Bash: 'siGnubash',
  'C/C++': 'siCplusplus',
  Neo4j: 'siNeo4j',
  FastAPI: 'siFastapi',
  Docker: 'siDocker',
  'Docker Compose': 'siDocker',
  PostgreSQL: 'siPostgresql',
  pgvector: 'siPostgresql',
  'Next.js': 'siNextdotjs',
  'GitHub Actions': 'siGithubactions',
  'GitHub Pages': 'siGithub',
  GitHub: 'siGithub',
  Git: 'siGit',
  DuckDB: 'siDuckdb',
  Transformers: 'siHuggingface',
  Streamlit: 'siStreamlit',
  pandas: 'siPandas',
  NumPy: 'siNumpy',
  SQLite: 'siSqlite',
  n8n: 'siN8n',
  'Discord API': 'siDiscord',
  'discord.py': 'siDiscord',
  'Telegram Bot API': 'siTelegram',
  Jupyter: 'siJupyter',
  'Cloudflare Workers': 'siCloudflareworkers',
  PyTorch: 'siPytorch',
  'scikit-learn': 'siScikitlearn',
  LangChain: 'siLangchain',
  LangGraph: 'siLangchain',
  ClickHouse: 'siClickhouse',
  Airbyte: 'siAirbyte',
  Metabase: 'siMetabase',
  'Google Docs API': 'siGoogledocs',
  Astro: 'siAstro',
  Plotly: 'siPlotly',
};

export interface ToolIcon {
  title: string;
  path: string;
}

export function toolIcon(name: string): ToolIcon | undefined {
  const key = keys[name];
  const icon = key ? (icons as unknown as Record<string, ToolIcon | undefined>)[key] : undefined;
  return icon ? { title: icon.title, path: icon.path } : undefined;
}
