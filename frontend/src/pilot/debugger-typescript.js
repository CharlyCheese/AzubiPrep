import ts from 'typescript';

const SOURCE_BYTES = 64 * 1024;
const SOURCE_LINES = 512;
const PROJECT_FILES = 16;
const lineBreak = /\r\n|[\n\r\u2028\u2029]/;
const lineCharacter = /[\n\r\u2028\u2029]/;
const reactTypeModules = Object.freeze({
  react: '/node_modules/@types/react/index.d.ts',
  csstype: '/node_modules/csstype/index.d.ts',
  'prop-types': '/node_modules/@types/prop-types/index.d.ts',
});
const reactTypeFiles = new Set([...Object.values(reactTypeModules), '/node_modules/@types/react/global.d.ts']);
const typedSource = name => /\.tsx?$/.test(name);
const scriptKind = name => name.endsWith('.tsx') ? ts.ScriptKind.TSX : name.endsWith('.jsx') ? ts.ScriptKind.JSX : name.endsWith('.js') ? ts.ScriptKind.JS : ts.ScriptKind.TS;
const extension = name => name.endsWith('.tsx') ? ts.Extension.Tsx : name.endsWith('.jsx') ? ts.Extension.Jsx : name.endsWith('.ts') ? ts.Extension.Ts : ts.Extension.Js;

// Validate before invoking the parser/checker, including when this module is used
// without the project importer. Libraries are trusted bundled input, never I/O.
function checkSources(files, react = false) {
  if (!files || typeof files !== 'object' || Array.isArray(files)) throw new Error('Ungültige TypeScript-Projektdateien.');
  const entries = Object.entries(files);
  if (!entries.length || entries.length > PROJECT_FILES) throw new Error('Bitte 1 bis 16 JavaScript-/TypeScript-Dateien verwenden.');
  const names = new Set(); let bytes = 0, lines = 0;
  for (const [name, source] of entries) {
    const parts = name.split('/');
    if (name.length > 128 || parts.length > 8 || parts.some(part => !/^[a-zA-Z0-9_-][a-zA-Z0-9_.-]{0,62}$/.test(part) || part.endsWith('.') || ['node_modules', 'local-rag', 'local-ai'].includes(part.toLowerCase()))
        || !(react ? /\.[jt]sx?$/ : /\.[jt]s$/).test(name) || /\.d\.tsx?$/i.test(name) || names.has(name.toLowerCase())) {
      throw new Error(react ? 'Bitte eindeutige, einfache .js-, .ts-, .jsx- oder .tsx-Projektpfade ohne private Pfadteile verwenden.' : 'Bitte eindeutige, einfache .js- oder .ts-Projektpfade ohne private Pfadteile verwenden.');
    }
    names.add(name.toLowerCase());
    if (typeof source !== 'string' || source.length > SOURCE_BYTES) throw new Error('Ungültiger Quelltext oder Quelltextgrenze erreicht.');
    bytes += new TextEncoder().encode(source).length;
    lines += source.split(lineBreak).length;
    if (bytes > SOURCE_BYTES || lines > SOURCE_LINES) throw new Error('Das Projekt darf insgesamt höchstens 64 KiB und 512 Quelltextzeilen enthalten.');
  }
  for (const name of names) {
    const parts = name.split('/'); parts.pop();
    while (parts.length) {
      if (names.has(parts.join('/'))) throw new Error('Ein Projektpfad ist zugleich Datei und Ordner.');
      parts.pop();
    }
  }
  return entries;
}

function sourceError(file, node, message) {
  const offset = typeof node === 'number' ? node : node.getStart(file);
  const position = file.getLineAndCharacterOfPosition(offset);
  return new Error(`${file.fileName.replace(/^\/project\//, '')}:${position.line + 1}:${position.character + 1}: ${message}`);
}

function diagnosticError(diagnostic, prefix) {
  const message = `${prefix} (TS${diagnostic.code}): ${ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ')}`;
  return diagnostic.file && diagnostic.start !== undefined ? sourceError(diagnostic.file, diagnostic.start, message) : new Error(message);
}

function boundedTree(file) {
  const stack = [[file, 0]]; let count = 0;
  while (stack.length) {
    const [node, depth] = stack.pop();
    if (++count > 8192 || depth > 64) throw sourceError(file, node, 'Die TypeScript-Struktur ist für den Debugger zu groß oder zu tief.');
    ts.forEachChild(node, child => { stack.push([child, depth + 1]); });
  }
}

const assertion = node => ts.isAsExpression(node) || ts.isSatisfiesExpression(node) || ts.isNonNullExpression(node) || ts.isTypeAssertionExpression(node) || ts.isExpressionWithTypeArguments(node);

function eraseSource(source, name) {
  const file = ts.createSourceFile(name, source, ts.ScriptTarget.ES2020, true, scriptKind(name));
  if (file.parseDiagnostics.length) throw diagnosticError(file.parseDiagnostics[0], 'TypeScript-Syntaxfehler');
  boundedTree(file);
  const spans = [], omitted = new Set();
  const omit = node => { omitted.add(node); spans.push([node.getStart(file), node.end]); };
  const fail = (node, detail) => { throw sourceError(file, node, detail); };
  const generic = (node, list) => {
    if (!list?.length) return;
    const children = node.getChildren(file);
    const open = children.find(child => child.kind === ts.SyntaxKind.LessThanToken && child.end === list.pos);
    const close = children.find(child => child.kind === ts.SyntaxKind.GreaterThanToken && child.pos === list.end);
    if (!open || !close) fail(node, 'Diese Generics lassen sich nicht positionsgleich entfernen.');
    spans.push([open.getStart(file), close.end]);
    for (const item of list) omitted.add(item);
  };
  const walk = node => {
    if (ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node)) { omit(node); return; }
    if (ts.isImportDeclaration(node) && node.importClause?.isTypeOnly || ts.isExportDeclaration(node) && node.isTypeOnly) { omit(node); return; }
    if (ts.isImportSpecifier(node) && node.isTypeOnly || ts.isExportSpecifier(node) && node.isTypeOnly) {
      fail(node, 'Typimporte und Typexporte bitte getrennt mit „import type“ oder „export type“ schreiben.');
    }
    if (ts.isClassDeclaration(node) || ts.isClassExpression(node) || ts.isEnumDeclaration(node) || ts.isModuleDeclaration(node)
        || ts.isDecorator(node) || ts.isImportEqualsDeclaration(node) || ts.isNamespaceExportDeclaration(node) || ts.isExportAssignment(node) && node.isExportEquals
        || node.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.DeclareKeyword)
        || ts.isFunctionDeclaration(node) && !node.body) {
      fail(node, 'Klassen, Enums, Namensräume, Dekoratoren und Deklarationen ohne Laufzeitcode werden im TypeScript-Debugger nicht unterstützt.');
    }
    if (ts.isParameter(node) && ts.isIdentifier(node.name) && node.name.text === 'this') fail(node, 'Explizite this-Parameter werden im TypeScript-Debugger nicht unterstützt.');
    if (assertion(node)) {
      if (ts.isTypeAssertionExpression(node)) spans.push([node.getStart(file), node.expression.getStart(file)]);
      else if (ts.isExpressionWithTypeArguments(node)) generic(node, node.typeArguments);
      else spans.push([node.expression.end, node.end]);
      walk(node.expression); return;
    }
    if (node.type) {
      const colon = node.getChildren(file).find(child => child.kind === ts.SyntaxKind.ColonToken && child.end <= node.type.pos);
      if (!colon) fail(node, 'Diese Typanmerkung lässt sich nicht positionsgleich entfernen.');
      spans.push([colon.getStart(file), node.type.end]); omitted.add(node.type);
    }
    generic(node, node.typeParameters);
    generic(node, node.typeArguments);
    if (ts.isParameter(node) && node.questionToken) omit(node.questionToken);
    if (ts.isVariableDeclaration(node) && node.exclamationToken) omit(node.exclamationToken);
    ts.forEachChild(node, child => { if (!omitted.has(child)) walk(child); });
  };
  walk(file);
  // split('') deliberately counts UTF-16 code units, including surrogate pairs.
  const units = source.split('');
  for (const [start, end] of spans) for (let index = start; index < end; index++) if (!lineCharacter.test(units[index])) units[index] = ' ';
  const erased = units.join('');
  const javascriptName = name.replace(/\.ts(x?)$/, '.js$1');
  const javascript = ts.createSourceFile(javascriptName, erased, ts.ScriptTarget.ES2020, true, scriptKind(javascriptName));
  if (javascript.parseDiagnostics.length) throw sourceError(file, javascript.parseDiagnostics[0].start || 0, 'Diese Typanmerkung würde beim Entfernen die JavaScript-Syntax ändern. Bitte die Laufzeitausdrücke mit Klammern oder Semikolons eindeutig trennen.');
  boundedTree(javascript);

  // Whitespace erasure alone can change automatic semicolon insertion. Compare
  // the complete runtime structure, including operators, before allowing it.
  function shape(node, original) {
    if (original && omitted.has(node)) return null;
    if (original && assertion(node)) return shape(node.expression, true);
    // TypeScript's JS parser accepts this invalid JS grammar and reports it
    // only during checking. A multiline erased return type must not allow it.
    if (!original && ts.isArrowFunction(node)) {
      const beforeArrow = node.getChildren(javascript).filter(child => child.end <= node.equalsGreaterThanToken.pos).at(-1);
      if (beforeArrow && lineBreak.test(erased.slice(beforeArrow.end, node.equalsGreaterThanToken.getStart(javascript)))) {
        throw sourceError(file, node.equalsGreaterThanToken.getStart(javascript), 'Diese Typanmerkung würde beim Entfernen die JavaScript-Syntax ändern: Vor dem Funktionspfeil darf kein Zeilenumbruch stehen.');
      }
    }
    const children = [];
    ts.forEachChild(node, child => {
      const value = shape(child, original);
      if (value !== null) children.push(value);
    });
    return [node.kind, ts.isSourceFile(node) ? null : node.text ?? null, node.operator ?? null,
      ts.isVariableDeclarationList(node) ? node.flags & ts.NodeFlags.BlockScoped : null, children];
  }
  if (JSON.stringify(shape(file, true)) !== JSON.stringify(shape(javascript, false))) {
    throw sourceError(file, spans[0]?.[0] || 0, 'Das Entfernen der Typen würde die Bedeutung des JavaScript-Codes ändern. Bitte die betroffenen Ausdrücke mit Klammern oder Semikolons eindeutig trennen.');
  }
  return { erased, file };
}

// Syntax-only helper for focused tests. Semantic checking belongs to prepare.
export function eraseDebugTypes(source, name = 'main.ts', options = {}) {
  checkSources({ [name]: source }, options?.react === true);
  return typedSource(name) ? eraseSource(source, name).erased : source;
}

function projectImport(base, requested, files) {
  if (!/^(?:\.\/|\.\.\/)/.test(requested) || requested.length > 128 || /[\\:\u0000]/.test(requested)) return undefined;
  const parts = base.replace(/^\/project\//, '').split('/'); parts.pop();
  for (const part of requested.split('/')) {
    if (part === '.') continue;
    if (part === '..') { if (!parts.length) return undefined; parts.pop(); }
    else parts.push(part);
  }
  const name = parts.join('/');
  return Object.hasOwn(files, name) ? { resolvedFileName: '/project/' + name, extension: extension(name), isExternalLibraryImport: false } : undefined;
}

export function prepareDebugTypeScript(files, libraries, settings = {}) {
  const react = settings?.react === true;
  const entries = checkSources(files, react);
  if (!entries.some(([name]) => typedSource(name))) return Object.fromEntries(entries);
  if (!libraries || typeof libraries !== 'object' || Array.isArray(libraries)) throw new Error('Die lokalen TypeScript-Typbibliotheken fehlen.');
  const output = {}, parsed = new Map();
  for (const [name, source] of entries) {
    if (!typedSource(name)) { output[name] = source; continue; }
    const prepared = eraseSource(source, name);
    if (prepared.file.checkJsDirective?.enabled === false || prepared.file.commentDirectives?.length) {
      throw sourceError(prepared.file, prepared.file.commentDirectives?.[0]?.range.pos ?? prepared.file.checkJsDirective.pos, 'Die strenge Typprüfung darf nicht mit @ts-nocheck, @ts-ignore oder @ts-expect-error ausgeschaltet werden.');
    }
    if (prepared.file.referencedFiles.length || prepared.file.typeReferenceDirectives.length || prepared.file.libReferenceDirectives.length) {
      throw sourceError(prepared.file, 0, 'Zusätzliche Typbibliotheken und Dreifach-Schrägstrich-Verweise sind nicht freigegeben.');
    }
    output[name] = prepared.erased;
  }
  const vfs = Object.create(null);
  for (const [name, source] of Object.entries(libraries)) if ((/^\/lib\/lib\.[a-z0-9.-]+\.d\.ts$/.test(name) || react && reactTypeFiles.has(name)) && typeof source === 'string') vfs[name] = source;
  if (react && [...reactTypeFiles].some(name => !Object.hasOwn(vfs, name))) throw new Error('Die lokalen React-Typbibliotheken fehlen oder sind unvollständig.');
  // The checker parses original text with its own module-detection options.
  for (const [name, source] of entries) vfs['/project/' + name] = source;
  const options = {
    target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler,
    strict: true, noEmit: true, verbatimModuleSyntax: true, allowImportingTsExtensions: true,
    allowJs: true, checkJs: false, skipLibCheck: true, types: [], moduleDetection: ts.ModuleDetectionKind.Force,
    lib: ['lib.es2020.d.ts', 'lib.dom.d.ts', 'lib.dom.iterable.d.ts'],
    ...(react ? { jsx: ts.JsxEmit.Preserve, allowSyntheticDefaultImports: true } : {}),
  };
  const host = {
    getSourceFile(name, language) {
      if (!Object.hasOwn(vfs, name)) return undefined;
      if (!parsed.has(name)) parsed.set(name, ts.createSourceFile(name, vfs[name], language, true, scriptKind(name)));
      return parsed.get(name);
    },
    getDefaultLibFileName: () => '/lib/lib.es2020.full.d.ts', getDefaultLibLocation: () => '/lib',
    getCurrentDirectory: () => '/project', getDirectories: () => [],
    getCanonicalFileName: name => name, useCaseSensitiveFileNames: () => true, getNewLine: () => '\n',
    fileExists: name => Object.hasOwn(vfs, name), readFile: name => Object.hasOwn(vfs, name) ? vfs[name] : undefined,
    directoryExists: name => Object.keys(vfs).some(file => file.startsWith(name.replace(/\/$/, '') + '/')),
    resolveModuleNames: (names, containingFile) => names.map(name => {
      // Learners get only React; its trusted declarations may also refer to
      // their two bundled dependencies. No package/path search is performed.
      if (react && Object.hasOwn(reactTypeModules, name) && (name === 'react' || reactTypeFiles.has(containingFile))) {
        return { resolvedFileName: reactTypeModules[name], extension: ts.Extension.Dts, isExternalLibraryImport: true };
      }
      return containingFile.startsWith('/project/') ? projectImport(containingFile, name, files) : undefined;
    }),
    resolveTypeReferenceDirectives: names => names.map(() => undefined),
    writeFile() {},
  };
  const roots = entries.filter(([name]) => typedSource(name)).map(([name]) => '/project/' + name);
  if (react) roots.push(reactTypeModules.react);
  const diagnostics = ts.getPreEmitDiagnostics(ts.createProgram(roots, options, host));
  if (diagnostics.length) throw diagnosticError(diagnostics[0], 'TypeScript-Typfehler');
  return output;
}
