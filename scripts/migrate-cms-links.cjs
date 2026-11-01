const ts = require('typescript'), fs = require('fs'), crypto = require('crypto');
const catalog = JSON.parse(fs.readFileSync('src/lib/cms-defaults.json', 'utf8'));
for (const [slug, definition] of Object.entries(catalog)) {
  if (slug === 'global') continue;
  const file = slug === 'home' ? 'src/app/(site)/page.tsx' : slug === 'article' ? 'src/app/(site)/blog/[slug]/page.tsx' : `src/app/(site)/${slug}/page.tsx`;
  const sf = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  definition.links ||= {};
  const f = ts.factory;
  function replacement(node) {
    if (!ts.isStringLiteral(node) || !/^[/#]/.test(node.text)) return null;
    let parent = node.parent, group = 'page';
    while (parent) {
      if (ts.isJsxElement(parent) && parent.openingElement.tagName.getText(sf) === 'CmsBuiltin') {
        group = parent.openingElement.attributes.properties.find(p => ts.isJsxAttribute(p) && p.name.getText(sf) === 'sectionKey')?.initializer?.text || group;
        break;
      }
      parent = parent.parent;
    }
    const key = 'link_' + crypto.createHash('sha256').update(group + ':' + node.text).digest('hex').slice(0, 12);
    definition.links[key] = { href: node.text, label: `Destination · ${group} · ${node.text}`, group };
    return f.createCallExpression(f.createIdentifier('cmsLink'), undefined, [f.createIdentifier('cms'), f.createStringLiteral(key), node]);
  }
  const result = ts.transform(sf, [context => root => {
    function visit(node) {
      if (node.pos < 0) return node;
      if (ts.isImportDeclaration(node) && node.moduleSpecifier.text === '@/lib/cms') {
        const binding = node.importClause.namedBindings;
        const elements = binding.elements.some(e => e.name.text === 'cmsLink') ? binding.elements : [...binding.elements, f.createImportSpecifier(false, undefined, f.createIdentifier('cmsLink'))];
        return f.updateImportDeclaration(node, node.modifiers, f.updateImportClause(node.importClause, false, node.importClause.name, f.updateNamedImports(binding, elements)), node.moduleSpecifier, node.attributes);
      }
      if (ts.isJsxAttribute(node) && node.name.getText(sf) === 'href' && node.initializer) {
        const value = replacement(node.initializer);
        if (value) return f.updateJsxAttribute(node, node.name, f.createJsxExpression(undefined, value));
      }
      if (ts.isPropertyAssignment(node) && node.name.getText(sf) === 'href') {
        const value = replacement(node.initializer);
        if (value) return f.updatePropertyAssignment(node, node.name, value);
      }
      return ts.visitEachChild(node, visit, context);
    }
    return ts.visitNode(root, visit);
  }]);
  fs.writeFileSync(file, ts.createPrinter().printFile(result.transformed[0]));
  result.dispose();
}
fs.writeFileSync('src/lib/cms-defaults.json', JSON.stringify(catalog, null, 2) + '\n');
