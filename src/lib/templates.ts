export interface NoteTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  defaultFolder: string;
  properties: TemplateProperty[];
  body: string;
}

export interface TemplateProperty {
  key: string;
  type: 'text' | 'date' | 'number' | 'list' | 'rating';
  default?: string;
}

export const VAULT_FOLDERS = [
  { path: '', label: 'Root (Personal)', description: 'Journal entries, essays, evergreen notes' },
  { path: 'References', label: 'References', description: 'Books, movies, places, people, podcasts' },
  { path: 'Clippings', label: 'Clippings', description: 'Articles and essays by others' },
  { path: 'Daily', label: 'Daily', description: 'Daily notes (YYYY-MM-DD)' },
  { path: 'Templates', label: 'Templates', description: 'Note templates' },
  { path: 'Attachments', label: 'Attachments', description: 'Images, PDFs, media' },
] as const;

export const RATING_LABELS: Record<number, string> = {
  7: 'Perfect — life-changing',
  6: 'Excellent — worth repeating',
  5: 'Good — enjoyable',
  4: 'Passable — works in a pinch',
  3: 'Bad — avoid if possible',
  2: 'Atrocious — actively avoid',
  1: 'Evil — life-changing (bad)',
};

export const NOTE_TEMPLATES: NoteTemplate[] = [
  {
    id: 'blank',
    name: 'Blank Note',
    icon: '📝',
    description: 'Start from scratch',
    defaultFolder: '',
    properties: [
      { key: 'created', type: 'date', default: 'today' },
      { key: 'categories', type: 'list' },
      { key: 'tags', type: 'list' },
    ],
    body: '',
  },
  {
    id: 'journal',
    name: 'Journal Entry',
    icon: '📓',
    description: 'Stream of consciousness, daily reflections',
    defaultFolder: '',
    properties: [
      { key: 'created', type: 'date', default: 'today' },
      { key: 'categories', type: 'list', default: 'journals' },
      { key: 'tags', type: 'list' },
    ],
    body: `## What happened\n\n\n\n## Thoughts\n\n\n\n## Connections\n\n`,
  },
  {
    id: 'evergreen',
    name: 'Evergreen Note',
    icon: '🌿',
    description: 'A single, atomic idea developed over time',
    defaultFolder: '',
    properties: [
      { key: 'created', type: 'date', default: 'today' },
      { key: 'categories', type: 'list', default: 'evergreens' },
      { key: 'tags', type: 'list' },
      { key: 'status', type: 'text', default: 'seedling' },
    ],
    body: `\n\n---\n\n## Related\n\n`,
  },
  {
    id: 'book',
    name: 'Book',
    icon: '📚',
    description: 'Book notes with author, rating, and review',
    defaultFolder: 'References',
    properties: [
      { key: 'created', type: 'date', default: 'today' },
      { key: 'categories', type: 'list', default: 'books' },
      { key: 'author', type: 'list' },
      { key: 'genre', type: 'list' },
      { key: 'start', type: 'date' },
      { key: 'end', type: 'date' },
      { key: 'rating', type: 'rating' },
      { key: 'tags', type: 'list' },
    ],
    body: `## Summary\n\n\n\n## Key Ideas\n\n\n\n## Quotes\n\n\n\n## Thoughts\n\n`,
  },
  {
    id: 'movie',
    name: 'Movie / Show',
    icon: '🎬',
    description: 'Movie or show with director, cast, rating',
    defaultFolder: 'References',
    properties: [
      { key: 'created', type: 'date', default: 'today' },
      { key: 'categories', type: 'list', default: 'movies' },
      { key: 'director', type: 'list' },
      { key: 'cast', type: 'list' },
      { key: 'genre', type: 'list' },
      { key: 'rating', type: 'rating' },
      { key: 'tags', type: 'list' },
    ],
    body: `## Synopsis\n\n\n\n## Thoughts\n\n\n\n## Memorable Quotes\n\n`,
  },
  {
    id: 'person',
    name: 'Person',
    icon: '👤',
    description: 'A person you know or admire',
    defaultFolder: 'References',
    properties: [
      { key: 'created', type: 'date', default: 'today' },
      { key: 'categories', type: 'list', default: 'people' },
      { key: 'tags', type: 'list' },
    ],
    body: `## About\n\n\n\n## Notes\n\n`,
  },
  {
    id: 'place',
    name: 'Place',
    icon: '📍',
    description: 'A restaurant, city, venue, or location',
    defaultFolder: 'References',
    properties: [
      { key: 'created', type: 'date', default: 'today' },
      { key: 'categories', type: 'list', default: 'places' },
      { key: 'city', type: 'text' },
      { key: 'neighborhood', type: 'text' },
      { key: 'rating', type: 'rating' },
      { key: 'tags', type: 'list' },
    ],
    body: `## About\n\n\n\n## Visits\n\n`,
  },
  {
    id: 'podcast',
    name: 'Podcast / Episode',
    icon: '🎙️',
    description: 'Podcast or episode with host and guests',
    defaultFolder: 'References',
    properties: [
      { key: 'created', type: 'date', default: 'today' },
      { key: 'categories', type: 'list', default: 'podcasts' },
      { key: 'host', type: 'list' },
      { key: 'guests', type: 'list' },
      { key: 'rating', type: 'rating' },
      { key: 'tags', type: 'list' },
    ],
    body: `## Summary\n\n\n\n## Key Takeaways\n\n\n\n## Quotes\n\n`,
  },
  {
    id: 'clipping',
    name: 'Web Clipping',
    icon: '✂️',
    description: 'Article or essay by someone else',
    defaultFolder: 'Clippings',
    properties: [
      { key: 'created', type: 'date', default: 'today' },
      { key: 'categories', type: 'list', default: 'clippings' },
      { key: 'author', type: 'list' },
      { key: 'source', type: 'text' },
      { key: 'tags', type: 'list' },
    ],
    body: `## Summary\n\n\n\n## Highlights\n\n\n\n## My Thoughts\n\n`,
  },
  {
    id: 'weekly',
    name: 'Weekly Review',
    icon: '📋',
    description: 'Weekly to-do list and review',
    defaultFolder: '',
    properties: [
      { key: 'created', type: 'date', default: 'today' },
      { key: 'categories', type: 'list', default: 'reviews' },
      { key: 'tags', type: 'list' },
    ],
    body: `## This Week\n\n### To Do\n\n- [ ] \n\n### Done\n\n- [x] \n\n## Reflections\n\n\n\n## Next Week\n\n`,
  },
];

export function generateFrontmatter(
  properties: TemplateProperty[],
  overrides: Record<string, string> = {}
): string {
  const lines: string[] = ['---'];
  const today = new Date().toISOString().split('T')[0];

  for (const prop of properties) {
    const value = overrides[prop.key] ?? (prop.default === 'today' ? today : prop.default);
    if (prop.type === 'list') {
      if (value) {
        const items = value.split(',').map(v => v.trim()).filter(Boolean);
        lines.push(`${prop.key}:`);
        items.forEach(item => lines.push(`  - ${item}`));
      } else {
        lines.push(`${prop.key}: []`);
      }
    } else if (prop.type === 'rating') {
      lines.push(`${prop.key}: ${value || ''}`);
    } else {
      lines.push(`${prop.key}: ${value || ''}`);
    }
  }

  lines.push('---');
  return lines.join('\n');
}

export function generateNoteContent(
  template: NoteTemplate,
  title: string,
  propertyOverrides: Record<string, string> = {}
): string {
  const frontmatter = generateFrontmatter(template.properties, propertyOverrides);
  return `${frontmatter}\n\n# ${title}\n\n${template.body}`;
}
