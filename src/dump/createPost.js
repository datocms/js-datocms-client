import generateFrontmatter from './generateFrontmatter';
import writeFile from './writeFile';

export default function createPost(file, format, { frontmatter, content = '' }) {
  return writeFile(file, generateFrontmatter(format, frontmatter) + content);
}
