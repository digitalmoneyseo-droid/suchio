import ts from "typescript";
import { servicesContent } from "../src/i18n/services.ts";
import { legalContent } from "../src/i18n/legal-content.ts";

// Idempotent metadata migration. Existing IDs survive later copy edits.
const slug = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const nameOf = (node) => node && (ts.isIdentifier(node) || ts.isStringLiteral(node)) ? node.text : undefined;
function ancestorObject(node, predicate) {
  for (let parent = node.parent; parent; parent = parent.parent) {
    if (ts.isObjectLiteralExpression(parent) && predicate(parent)) return parent;
  }
}
function property(node, key) { return node.properties.find((item) => ts.isPropertyAssignment(item) && nameOf(item.name) === key); }

for (const path of ["src/i18n/services.ts", "src/i18n/services-fr.ts", "src/i18n/legal-content.ts"]) {
  const text = await Bun.file(path).text();
  const source = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true);
  const edits = [];
  function visit(node) {
    if (ts.isPropertyAssignment(node) && ts.isArrayLiteralExpression(node.initializer)) {
      const key = nameOf(node.name);
      let reference;
      if (["outcomes", "scopeGroups", "process", "faqs"].includes(key)) {
        const service = ancestorObject(node, (object) => ts.isStringLiteral(property(object, "id")?.initializer ?? source));
        const id = service && property(service, "id").initializer.text;
        reference = servicesContent.en.services.find((item) => item.id === id)?.page[key];
      } else if (key === "sections") {
        const page = ancestorObject(node, (object) => ts.isPropertyAssignment(object.parent) && ["imprint", "privacy"].includes(nameOf(object.parent.name)));
        if (page) reference = legalContent.en[nameOf(page.parent.name)].sections;
      }
      if (reference) node.initializer.elements.forEach((item, index) => {
        if (!ts.isObjectLiteralExpression(item) || property(item, "id")) return;
        const original = reference[index];
        if (!original) throw new Error(`${path}: unmatched ${key}[${index}]`);
        const id = original.id ?? slug(original.title ?? original.question);
        edits.push({ position: item.getStart(source) + 1, text: ` id: ${JSON.stringify(id)},` });
      });
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  let result = text;
  for (const edit of edits.sort((a, b) => b.position - a.position)) result = result.slice(0, edit.position) + edit.text + result.slice(edit.position);
  if (edits.length) await Bun.write(path, result);
  console.log(`${path}: ${edits.length} IDs added`);
}
