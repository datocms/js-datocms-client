import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import toml from 'toml-js';

function fileExists(filePath) {
  try {
    fs.accessSync(filePath);
    return true;
  } catch (e) {
    return false;
  }
}

function detectRubyGenerator(dir) {
  const rubyGenerators = [
    'middleman',
    'jekyll',
    'nanoc',
  ];

  const gemfilePath = path.join(dir, 'Gemfile');
  if (!fileExists(gemfilePath)) { return undefined; }

  const gemfile = fs.readFileSync(gemfilePath, 'utf8');

  return rubyGenerators.find(gen => gemfile.match(`('${gen}'|"${gen}")`));
}

function detectNodeGenerator(dir) {
  const nodeGenerators = [
    'brunch',
    'assemble',
    'ember-cli',
    'hexo',
    'metalsmith',
    'react-scripts',
    'roots',
    'docpad',
    'wintersmith',
    'gatsby',
    'harp',
    'grunt',
    'gulp',
  ];

  const pkgPath = path.join(dir, 'package.json');
  if (!fileExists(pkgPath)) { return undefined; }

  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const deps = pkg.dependencies || {};
    const devDeps = pkg.devDependencies || {};
    const allDeps = Object.assign(deps, devDeps);
    return nodeGenerators.find(gen => gen in allDeps);
  } catch (err) {
    if (err instanceof SyntaxError) { return undefined; }
    throw err;
  }
}

function detectPythonGenerator(dir) {
  const pythonGenerators = [
    'mkdocs',
    'pelican',
    'cactus',
  ];

  const requirementsPath = path.join(dir, 'requirements.txt');
  if (!fileExists(requirementsPath)) { return undefined; }

  const requirements = fs.readFileSync(requirementsPath, 'utf8');
  return pythonGenerators.find(gen => requirements.match(`^${gen}(==)?`));
}

function detectHugo(dir) {
  const configs = [
    {
      file: 'config.toml',
      loader: content => toml.parse(content),
    },
    {
      file: 'config.yaml',
      loader: content => yaml.safeLoad(content),
    },
    {
      file: 'config.json',
      loader: content => JSON.parse(content),
    },
  ];

  const isHugo = configs.find((option) => {
    const configPath = path.join(dir, option.file);
    if (!fileExists(configPath)) { return false; }

    try {
      const config = option.loader(fs.readFileSync(configPath, 'utf8'));
      return ('baseurl' in config);
    } catch (e) {
      return false;
    }
  });

  return isHugo && 'hugo';
}

export default function detectSsg(dir) {
  return detectRubyGenerator(dir)
    || detectNodeGenerator(dir)
    || detectPythonGenerator(dir)
    || detectHugo(dir)
    || 'unknown';
}
