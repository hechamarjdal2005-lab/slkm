// One-time source migration: preserve existing copy as editable CMS defaults.
// Re-running skips migrated files and preserves the previously extracted catalog.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const ts = require('typescript');
const catalogPath = 'src/lib/cms-defaults.json';
const catalog = fs.existsSync(catalogPath) ? JSON.parse(fs.readFileSync(catalogPath, 'utf8')) : {};
const sources = [
  ['home', '/', 'Accueil', 'src/app/(site)/page.tsx'],
  ['lignes', '/lignes', 'Lignes & agences', 'src/app/(site)/lignes/page.tsx'],
  ['irsaliyat', '/irsaliyat', 'Messageries', 'src/app/(site)/irsaliyat/page.tsx'],
  ['about', '/about', 'Notre histoire', 'src/app/(site)/about/page.tsx'],
  ['services', '/services', 'Transport de personnel', 'src/app/(site)/services/page.tsx'],
  ['contact', '/contact', 'Contact', 'src/app/(site)/contact/page.tsx'],
  ['blog', '/blog', 'Actualités', 'src/app/(site)/blog/page.tsx'],
  ['article', '/blog/[slug]', 'Modèle des articles', 'src/app/(site)/blog/[slug]/page.tsx'],
  ['global', 'global', 'Pied de page', 'src/components/site-footer.tsx'],
  ['lignes', '/lignes', 'Lignes & agences', 'src/components/transport-network-explorer.tsx'],
  ['irsaliyat', '/irsaliyat', 'Messageries', 'src/components/tracking-form.tsx'],
];
const parse = text => {
  const parsed = ts.createSourceFile('injected.tsx', text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const synthesize = node => { ts.setTextRange(node, { pos: -1, end: -1 }); node.flags |= ts.NodeFlags.Synthesized; ts.forEachChild(node, synthesize); };
  for (const statement of parsed.statements) synthesize(statement);
  return parsed.statements;
};
const hash = value => crypto.createHash('sha256').update(value).digest('hex').slice(0, 12);
function literal(node) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return { text: node.text, variables: [] };
  if (ts.isTemplateExpression(node)) {
    return { text: node.head.text + node.templateSpans.map(span => `{{${span.expression.getText()}}}${span.literal.text}`).join(''), variables: node.templateSpans.map(span => span.expression) };
  }
  return null;
}
for (const [slug, route, label, filename] of sources) {
  const source = fs.readFileSync(filename, 'utf8');
  if (source.includes('createTranslator')) continue;
  const sf = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const client = source.startsWith('"use client"');
  const footer = slug === 'global';
  const page = !client && !footer;
  const defaults = catalog[slug] ||= { slug, route, label, copy: {}, images: {}, sections: [] };
  let sectionGroup = 'Contenu de page';
  let count = 0;
  const f = ts.factory;
  const translated = (fr, ar, en, force) => {
    const values = [fr, ar, en].map(literal);
    if (values.some(value => !value)) return null;
    // Booking/tracking message templates remain application-controlled.
    if (client && values.some(value => value.variables.length)) return null;
    const key = `text_${hash(values[0].text)}`;
    defaults.copy[key] = { fr: values[0].text, ar: values[1].text, en: values[2].text, label: values[0].text.slice(0, 110), group: sectionGroup };
    const args = [f.createStringLiteral(key), fr, ar, en];
    const variables = [...new Map(values.flatMap(value => value.variables).map(value => [value.getText(), value])).entries()];
    if (force || variables.length) args.push(force ? f.createStringLiteral(force) : f.createIdentifier('undefined'));
    if (variables.length) args.push(f.createObjectLiteralExpression(variables.map(([key, expression]) => f.createPropertyAssignment(f.createStringLiteral(key), expression))));
    return f.createCallExpression(f.createIdentifier('ct'), undefined, args);
  };
  const image = node => {
    const value = literal(node);
    if (!value || value.variables.length || !value.text.startsWith('/images/')) return null;
    const key = `image_${hash(value.text)}`;
    defaults.images[key] = { src: value.text, label: path.basename(value.text), group: sectionGroup };
    return f.createCallExpression(f.createIdentifier('cmsImage'), undefined, [f.createIdentifier('cms'), f.createStringLiteral(key), node]);
  };
  const transformed = ts.transform(sf, [context => {
    function visit(node) {
      if (node.pos < 0) return node;
      if (ts.isVariableDeclaration(node) && node.name.getText(sf) === 'NAV') return node;
      if (ts.isConditionalExpression(node)) {
        const a = node.condition.getText(sf).match(/locale\s*===\s*["'](ar|en)["']/);
        if (a && ts.isConditionalExpression(node.whenFalse)) {
          const b = node.whenFalse.condition.getText(sf).match(/locale\s*===\s*["'](ar|en)["']/);
          if (b && a[1] !== b[1]) {
            const slots = { fr: node.whenFalse.whenFalse, [a[1]]: node.whenTrue, [b[1]]: node.whenFalse.whenTrue };
            const result = translated(slots.fr, slots.ar, slots.en);
            if (result) return result;
          }
        }
      }
      if (ts.isCallExpression(node)) {
        const name = node.expression.getText(sf);
        const args = name === 't' ? node.arguments : name === 'pick' && node.arguments[0]?.getText(sf) === 'locale' ? node.arguments.slice(1) : [];
        if (args.length === 3) { const result = translated(...args); if (result) return result; }
      }
      if (ts.isObjectLiteralExpression(node)) {
        let properties = [...node.properties];
        for (const names of [['fr', 'ar', 'en'], ['titleFr', 'titleAr', 'titleEn'], ['textFr', 'textAr', 'textEn']]) {
          const props = names.map(name => properties.find(prop => ts.isPropertyAssignment(prop) && prop.name.getText(sf) === name));
          if (props.every(Boolean) && props.every(prop => literal(prop.initializer))) {
            const originals = props.map(prop => prop.initializer);
            properties = properties.map(prop => {
              const index = props.indexOf(prop);
              return index < 0 ? prop : f.updatePropertyAssignment(prop, prop.name, translated(...originals, ['fr', 'ar', 'en'][index]));
            });
          }
        }
        return f.updateObjectLiteralExpression(node, properties.map(prop => {
          if (ts.isPropertyAssignment(prop) && ['image', 'image_url'].includes(prop.name.getText(sf))) {
            const result = image(prop.initializer);
            if (result) return f.updatePropertyAssignment(prop, prop.name, result);
          }
          return ts.visitEachChild(prop, visit, context);
        }));
      }
      if (ts.isJsxAttribute(node) && ['src', 'image'].includes(node.name.getText(sf)) && node.initializer && ts.isStringLiteral(node.initializer)) {
        const result = image(node.initializer);
        if (result) return f.updateJsxAttribute(node, node.name, f.createJsxExpression(undefined, result));
      }
      return ts.visitEachChild(node, visit, context);
    }
    function branch(node) {
      if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
        const opening = ts.isJsxElement(node) ? node.openingElement : node;
        const tag = opening.tagName.getText(sf);
        if (['section', 'PageHero', 'MessagerieNetworkSection'].includes(tag)) {
          const id = opening.attributes.properties.find(prop => ts.isJsxAttribute(prop) && prop.name.getText(sf) === 'id' && prop.initializer && ts.isStringLiteral(prop.initializer));
          const classes = opening.attributes.properties.find(prop => ts.isJsxAttribute(prop) && prop.name.getText(sf) === 'className' && prop.initializer && ts.isStringLiteral(prop.initializer))?.initializer?.text || '';
          const key = id?.initializer.text || (tag === 'PageHero' || classes.includes('home-hero') ? 'hero' : tag === 'MessagerieNetworkSection' ? 'parcel-network' : `section-${++count}`);
          sectionGroup = key;
          defaults.sections.push({ key, label: key === 'hero' ? 'Introduction / bannière' : id?.initializer.text || (tag === 'MessagerieNetworkSection' ? 'Carte et agences de messagerie' : `Section ${defaults.sections.length + 1}`), sort_order: defaults.sections.length * 10 });
          let child = visit(node);
          const firstCopy = Object.values(defaults.copy).find(field => field.group === key);
          if (firstCopy && defaults.sections.at(-1).label.startsWith('Section ')) defaults.sections.at(-1).label = firstCopy.fr.slice(0, 65);
          return f.createJsxElement(f.createJsxOpeningElement(f.createIdentifier('CmsBuiltin'), undefined, f.createJsxAttributes([f.createJsxAttribute(f.createIdentifier('sectionKey'), f.createStringLiteral(key))])), [child], f.createJsxClosingElement(f.createIdentifier('CmsBuiltin')));
        }
        // Lignes has a single root container; retain it as a controlled block.
        if (tag === 'div') {
          const key = 'network';
          defaults.sections.push({ key, label: 'Carte, recherche et agences', sort_order: 0 });
          return f.createJsxElement(f.createJsxOpeningElement(f.createIdentifier('CmsBuiltin'), undefined, f.createJsxAttributes([f.createJsxAttribute(f.createIdentifier('sectionKey'), f.createStringLiteral(key))])), [visit(node)], f.createJsxClosingElement(f.createIdentifier('CmsBuiltin')));
        }
      }
      return ts.visitEachChild(node, branch, context);
    }
    function main(node) {
      const target = ts.isFunctionDeclaration(node) && (page ? node.modifiers?.some(mod => mod.kind === ts.SyntaxKind.DefaultKeyword) : node.name?.text === (footer ? 'SiteFooter' : filename.includes('tracking') ? 'TrackingForm' : 'TransportNetworkExplorer'));
      if (target) {
        const statements = node.body.statements.map(statement => {
          if (page && ts.isReturnStatement(statement) && statement.expression) {
            const expression = ts.isParenthesizedExpression(statement.expression) ? statement.expression.expression : statement.expression;
            const content = branch(expression);
            return f.updateReturnStatement(statement, f.createJsxElement(f.createJsxOpeningElement(f.createIdentifier('CmsPage'), undefined, f.createJsxAttributes([f.createJsxAttribute(f.createIdentifier('cms'), f.createJsxExpression(undefined, f.createIdentifier('cms')))])), [content], f.createJsxClosingElement(f.createIdentifier('CmsPage'))));
          }
          return visit(statement);
        });
        const injected = parse(`const cms = ${client ? `usePageCMS("${slug}")` : `await getPageCMS("${slug}")`}; const ct = createTranslator(cms, locale);`);
        const originalLocaleIndex = node.body.statements.findIndex(statement => statement.getText(sf).startsWith('const locale ='));
        statements.splice(originalLocaleIndex >= 0 ? originalLocaleIndex + 1 : 0, 0, ...injected);
        const modifiers = footer ? [...node.modifiers || [], f.createModifier(ts.SyntaxKind.AsyncKeyword)] : node.modifiers;
        return f.updateFunctionDeclaration(node, modifiers, node.asteriskToken, node.name, node.typeParameters, node.parameters, node.type, f.updateBlock(node.body, statements));
      }
      if (page && ts.isVariableStatement(node) && node.modifiers?.some(mod => mod.kind === ts.SyntaxKind.ExportKeyword) && node.declarationList.declarations[0]?.name.getText(sf) === 'metadata') {
        return parse(`export async function generateMetadata(): Promise<Metadata> { return getCMSMetadata("${slug}", ${node.declarationList.declarations[0].initializer.getText(sf)}); }`)[0];
      }
      return node;
    }
    return root => {
    const imports = parse(`import { createTranslator, cmsImage } from "@/lib/cms"; ${client ? 'import { usePageCMS } from "@/components/cms-provider";' : 'import { getPageCMS, getCMSMetadata } from "@/lib/cms-store";'} ${page ? 'import { CmsPage, CmsBuiltin } from "@/components/cms-page";' : ''}`);
    const statements = sf.statements.map(main);
    const directive = client ? 1 : 0;
    statements.splice(directive, 0, ...imports);
    return f.updateSourceFile(sf, statements);
    };
  }]);
  fs.writeFileSync(filename, ts.createPrinter({ newLine: ts.NewLineKind.LineFeed }).printFile(transformed.transformed[0]));
  transformed.dispose();
}
fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + '\n');
console.log(Object.values(catalog).map(page => `${page.slug}: ${Object.keys(page.copy).length} texts, ${Object.keys(page.images).length} images, ${page.sections.length} sections`).join('\n'));
