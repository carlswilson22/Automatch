/** Read-only audit of source reachability and direct runtime dependencies. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'espree';

const root = fileURLToPath(new URL('../', import.meta.url));
const sourceRoot = path.join(root, 'src');
const list = folder => fs.readdirSync(folder, { withFileTypes: true }).flatMap(entry => {
  const location = path.join(folder, entry.name);
  return entry.isDirectory() ? list(location) : [location];
});
const files = list(sourceRoot).filter(file => /\.(js|jsx|css)$/.test(file));
const graph = new Map();
const dependencies = new Map();
const errors = [];
const relative = file => path.relative(root, file).split(path.sep).join('/');
const packageName = specifier => specifier.startsWith('@') ? specifier.split('/').slice(0, 2).join('/') : specifier.split('/')[0];

for (const file of files) {
  const edges = new Set();
  const imports = new Set();
  graph.set(file, edges);
  dependencies.set(file, imports);
  if (file.endsWith('.css')) continue;
  const source = fs.readFileSync(file, 'utf8');
  const ast = parse(source, { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } });
  const visit = node => {
    if (!node || typeof node !== 'object') return;
    if (['ImportDeclaration', 'ExportNamedDeclaration', 'ExportAllDeclaration', 'ImportExpression'].includes(node.type) && typeof node.source?.value === 'string') {
      const specifier = node.source.value;
      if (specifier.startsWith('.')) {
        const candidate = path.resolve(path.dirname(file), specifier);
        const resolved = [candidate, ...['.js', '.jsx', '.css'].map(extension => candidate + extension), path.join(candidate, 'index.js')]
          .find(location => fs.existsSync(location) && fs.statSync(location).isFile());
        if (resolved) edges.add(resolved);
        else errors.push(`Import não resolvido: ${relative(file)} → ${specifier}`);
      } else imports.add(packageName(specifier));
    }
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) value.forEach(visit);
      else if (value?.type) visit(value);
    }
  };
  visit(ast);
}

const reachable = new Set();
const follow = file => {
  if (reachable.has(file)) return;
  reachable.add(file);
  for (const dependency of graph.get(file) || []) follow(dependency);
};
follow(path.join(sourceRoot, 'main.jsx'));
const usedPackages = new Set([...reachable].flatMap(file => [...(dependencies.get(file) || [])]));
for (const file of files) if (!reachable.has(file)) errors.push(`Módulo fora da aplicação: ${relative(file)}`);
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
for (const name of Object.keys(manifest.dependencies || {})) if (!usedPackages.has(name)) errors.push(`Dependência sem consumidor na aplicação: ${name}`);

if (errors.length) {
  for (const error of errors) console.error(error);
  process.exitCode = 1;
} else console.log(`Uso verificado: ${files.length} módulos alcançáveis, imports resolvidos e ${Object.keys(manifest.dependencies).length} dependências de execução com consumidores.`);
