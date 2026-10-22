import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';

const failures = [];

function check(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      check(path);
      continue;
    }
    if (!path.endsWith('.ts')) continue;
    const source = ts.createSourceFile(
      path,
      readFileSync(path, 'utf8'),
      ts.ScriptTarget.Latest,
      true,
    );
    const visit = (node) => {
      if (ts.isClassDeclaration(node)) {
        for (let index = 1; index < node.members.length; index++) {
          const previous = node.members[index - 1];
          const current = node.members[index];
          const end = source.getLineAndCharacterOfPosition(previous.end).line;
          const start = source.getLineAndCharacterOfPosition(current.getStart(source)).line;
          if (start - end !== 2)
            failures.push(`${path}:${start + 1}: Separate class members with one blank line.`);
        }
        for (const member of node.members) {
          if (
            (ts.isMethodDeclaration(member) ||
              ts.isConstructorDeclaration(member) ||
              ts.isAccessor(member)) &&
            member.body
          ) {
            const start = source.getLineAndCharacterOfPosition(member.body.getStart(source)).line;
            const end = source.getLineAndCharacterOfPosition(member.body.end).line;
            if (start === end) failures.push(`${path}:${start + 1}: Use multiline method bodies.`);
          }
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
  }
}

check('src/app');
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log('Angular class style checks passed.');
}
