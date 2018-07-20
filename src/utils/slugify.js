import speakingurl from 'speakingurl';

export default function slugify(text) {
  return speakingurl(text)
    .toLowerCase()
    .replace(/[^a-z0-9\-_]+/, '-')
    .replace(/-{2,}/, '-')
    .substr(0, 51)
    .replace(/^-|-$/, '');
}
