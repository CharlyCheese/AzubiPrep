import ts from 'typescript';
import libraries from 'virtual:course-types';

// This worker parses/types/translates source only. No learner code is evaluated.
let accepted = false;
self.onmessage = ({ data }) => {
  if (accepted) return;
  accepted = true;
  try {
    const files = data.files;
    if (!files || Object.keys(files).length > 50) throw new Error('Zu viele Dateien.');
    const sources = Object.entries(files).filter(([name]) => /\.(?:[jt]sx?)$/.test(name));
    if (sources.some(([name, file]) => !/^[\w./-]+$/.test(name) || name.includes('..') || typeof file.content !== 'string' || file.content.length > 131072)) throw new Error('Ungültige Quelldatei.');
    const options = { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, strict: true, jsx: ts.JsxEmit.React, allowUmdGlobalAccess: true, esModuleInterop: true, skipLibCheck: true, noEmit: true, moduleResolution: ts.ModuleResolutionKind.Node10, lib: ['lib.es2020.d.ts', 'lib.dom.d.ts', 'lib.dom.iterable.d.ts'], types: ['react', 'react-dom'] };
    const vfs = { ...libraries, ...Object.fromEntries(sources.map(([name, file]) => ['/project/' + name, file.content])) };
    const host = {
      getSourceFile: (name, language) => Object.hasOwn(vfs, name) ? ts.createSourceFile(name, vfs[name], language) : undefined,
      getDefaultLibFileName: () => '/lib/lib.es2020.full.d.ts', writeFile() {}, getCurrentDirectory: () => '/project',
      getDirectories: () => [], fileExists: name => Object.hasOwn(vfs, name), readFile: name => vfs[name],
      directoryExists: name => Object.keys(vfs).some(file => file.startsWith(name.replace(/\/$/, '') + '/')),
      getCanonicalFileName: name => name, useCaseSensitiveFileNames: () => true, getNewLine: () => '\n',
    };
    const roots = sources.filter(([name]) => /\.tsx?$/.test(name)).map(([name]) => '/project/' + name);
    const diagnostics = roots.length ? ts.getPreEmitDiagnostics(ts.createProgram(roots, options, host)).slice(0, 30).map(d => {
      const pos = d.file && d.start !== undefined ? d.file.getLineAndCharacterOfPosition(d.start) : null;
      return `${d.file?.fileName || 'Typprüfung'}${pos ? ':' + (pos.line + 1) + ':' + (pos.character + 1) : ''}: ${ts.flattenDiagnosticMessageText(d.messageText, '\n')}`;
    }) : [];
    const compiled = sources.map(([name, file]) => {
      const source = ts.createSourceFile(name, file.content, ts.ScriptTarget.Latest, true);
      const imports = [];
      const walk = node => {
        if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier) imports.push(node.moduleSpecifier.text);
        if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) throw new Error('Dynamische Importe sind in dieser Übung nicht freigegeben.');
        ts.forEachChild(node, walk);
      };
      walk(source);
      for (const target of imports) if (!target.startsWith('./') && !target.startsWith('../') && !['react', 'react-dom/client', 'react-router-dom', 'node:test', 'node:assert/strict'].includes(target)) throw new Error('Nicht freigegebenes Modul: ' + target);
      const result = ts.transpileModule(file.content, { fileName: name, compilerOptions: { ...options, noEmit: false }, reportDiagnostics: true });
      for (const d of result.diagnostics || []) diagnostics.push(name + ': ' + ts.flattenDiagnosticMessageText(d.messageText, '\n'));
      return { name, code: result.outputText, module: ts.isExternalModule(source) };
    });
    self.postMessage({ compiled, diagnostics });
  } catch (error) { self.postMessage({ error: error.message }); }
  self.close();
};
