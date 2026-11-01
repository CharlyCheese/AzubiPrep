import ts from 'typescript';
import { checkJsDraft } from './js-draft.js';
import { debuggerLimits, encodedSize, debugSourceLines } from './debugger-core.js';
import { checkDebugProject, checkModulePath, resolveDebugImport } from './debugger-project.js';

export function compileDebugger(draft, overrides, moduleContext = null) {
  const limits = debuggerLimits(overrides);
  if (moduleContext) { checkModulePath(draft.name); checkJsDraft({ ...draft, name: draft.name.split('/').at(-1) }); } else checkJsDraft(draft);
  if (encodedSize(draft.source) > limits.sourceBytes) throw new Error('Quelltextgrenze erreicht.');
  if (debugSourceLines(draft.source).length > limits.sourceLines) throw new Error('Zeilengrenze erreicht.');
  const file = ts.createSourceFile(draft.name, draft.source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  if (file.parseDiagnostics.length) throw new Error('Syntaxfehler: ' + ts.flattenDiagnosticMessageText(file.parseDiagnostics[0].messageText, ' '));
  let nodes = 0, maxDepth = 0;
  const stack = [[file, 0]];
  while (stack.length) {
    const [node, depth] = stack.pop(); maxDepth = Math.max(maxDepth, depth);
    if (++nodes > limits.astNodes || depth > limits.astDepth) throw new Error('AST-Größen-/Tiefengrenze erreicht.');
    ts.forEachChild(node, child => { stack.push([child, depth + 1]); });
  }
  const helper = '__azubi_dbg_checkpoint', points = moduleContext?.points || [], functions = moduleContext?.functions || [{ id: 0, name: 'Programm' }];
  let scopeId = moduleContext?.scopeId || 0;
  const exportModifiers = node => !!moduleContext && node.modifiers?.every(item => item.kind === ts.SyntaxKind.ExportKeyword || item.kind === ts.SyntaxKind.DefaultKeyword);
  const fail = node => {
    const pos = file.getLineAndCharacterOfPosition(node.getStart(file));
    throw new Error(`Im Debugger-Technikpilot noch nicht unterstützt (Zeile ${pos.line + 1}): ${ts.SyntaxKind[node.kind]}. Erlaubt sind const/let, Bedingungen, Schleifen, Arrayliterale, benannte Funktionen und console.log.`);
  };
  const reserved = name => name.startsWith('__azubi_dbg') || ['console', 'eval', 'Function', 'globalThis', 'window', 'self', 'undefined', 'NaN', 'Infinity', 'arguments'].includes(name);
  const forbiddenKey = key => key.startsWith('__azubi_dbg') || ['__proto__', 'prototype', 'constructor', 'toString', 'valueOf', 'toJSON', '__defineGetter__', '__defineSetter__', '__lookupGetter__', '__lookupSetter__'].includes(key);
  const fieldName = node => {
    if (!ts.isIdentifier(node) && !ts.isStringLiteral(node) && !ts.isNumericLiteral(node)) fail(node);
    const name = node.text; if (forbiddenKey(name)) fail(node); return name;
  };
  const bindingName = node => {
    if (!ts.isIdentifier(node) || reserved(node.text) || moduleContext && ['implements','interface','let','package','private','protected','public','static','yield','await','enum'].includes(node.text) || node.text.length > limits.identifiers) fail(node);
    return node.text;
  };
  const resolve = (name, scopes) => {
    for (let i = scopes.length - 1; i >= 0; i--) if (scopes[i].bindings.has(name)) return scopes[i].bindings.get(name);
    return null;
  };
  const reference = (node, scopes) => {
    if (ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node)) { member(node, scopes); return; }
    if (!ts.isIdentifier(node) || !['variable', 'parameter'].includes(resolve(node.text, scopes))) fail(node);
  };
  function member(node, scopes) {
    if (node.questionDotToken) fail(node);
    expression(node.expression, scopes);
    if (ts.isPropertyAccessExpression(node)) fieldName(node.name);
    else { if (!node.argumentExpression) fail(node); expression(node.argumentExpression, scopes); if (ts.isStringLiteral(node.argumentExpression) && forbiddenKey(node.argumentExpression.text)) fail(node); }
  }
  const binary = new Set([ts.SyntaxKind.PlusToken, ts.SyntaxKind.MinusToken, ts.SyntaxKind.AsteriskToken, ts.SyntaxKind.SlashToken, ts.SyntaxKind.PercentToken, ts.SyntaxKind.AsteriskAsteriskToken, ts.SyntaxKind.LessThanToken, ts.SyntaxKind.LessThanEqualsToken, ts.SyntaxKind.GreaterThanToken, ts.SyntaxKind.GreaterThanEqualsToken, ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken, ts.SyntaxKind.AmpersandAmpersandToken, ts.SyntaxKind.BarBarToken, ts.SyntaxKind.QuestionQuestionToken]);
  const assignment = new Set([ts.SyntaxKind.EqualsToken, ts.SyntaxKind.PlusEqualsToken, ts.SyntaxKind.MinusEqualsToken, ts.SyntaxKind.AsteriskEqualsToken, ts.SyntaxKind.SlashEqualsToken]);
  const callbackMethods = new Set(['map', 'filter', 'forEach', 'some', 'every', 'find', 'reduce']);
  const errorConstructors = new Set(['Error', 'TypeError', 'RangeError', 'ReferenceError', 'SyntaxError', 'URIError', 'EvalError']);
  const unwrapped = node => { while (ts.isParenthesizedExpression(node)) node = node.expression; return node; };
  function expression(node, scopes) {
    if (ts.isNewExpression(node)) {
      if (!ts.isIdentifier(node.expression) || !errorConstructors.has(node.expression.text) || resolve(node.expression.text, scopes) || node.typeArguments?.length || (node.arguments?.length || 0) > 1) fail(node);
      for (const arg of node.arguments || []) expression(arg, scopes);
      return;
    }
    if (ts.isNumericLiteral(node) || ts.isStringLiteral(node) || [ts.SyntaxKind.TrueKeyword, ts.SyntaxKind.FalseKeyword, ts.SyntaxKind.NullKeyword].includes(node.kind)) return;
    if (ts.isArrayLiteralExpression(node)) { for (const item of node.elements) expression(item, scopes); return; }
    if (ts.isObjectLiteralExpression(node)) {
      for (const property of node.properties) {
        if (ts.isPropertyAssignment(property)) { fieldName(property.name); expression(property.initializer, scopes); }
        else if (ts.isShorthandPropertyAssignment(property) && !property.objectAssignmentInitializer) { fieldName(property.name); expression(property.name, scopes); }
        else fail(property);
      }
      return;
    }
    if (ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node)) { member(node, scopes); return; }
    if (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) { if (node.name || node.modifiers?.length || node.asteriskToken || node.type || node.typeParameters?.length) fail(node); return; }
    if (ts.isIdentifier(node)) { if (!resolve(node.text, scopes) && !['undefined', 'NaN', 'Infinity'].includes(node.text) && !(moduleContext?.dom && node.text==='document')) fail(node); return; }
    if (ts.isParenthesizedExpression(node)) { expression(node.expression, scopes); return; }
    if (ts.isBinaryExpression(node)) {
      if (assignment.has(node.operatorToken.kind)) reference(node.left, scopes);
      else if (binary.has(node.operatorToken.kind)) expression(node.left, scopes); else fail(node);
      expression(node.right, scopes); return;
    }
    if (ts.isPrefixUnaryExpression(node)) {
      if ([ts.SyntaxKind.PlusPlusToken, ts.SyntaxKind.MinusMinusToken].includes(node.operator)) reference(node.operand, scopes);
      else if ([ts.SyntaxKind.PlusToken, ts.SyntaxKind.MinusToken, ts.SyntaxKind.ExclamationToken].includes(node.operator)) expression(node.operand, scopes); else fail(node);
      return;
    }
    if (ts.isPostfixUnaryExpression(node)) { reference(node.operand, scopes); return; }
    if (ts.isTypeOfExpression(node)) { if (ts.isIdentifier(node.expression) && resolve(node.expression.text, scopes) === 'function') return; expression(node.expression, scopes); return; }
    if (ts.isConditionalExpression(node)) { expression(node.condition, scopes); expression(node.whenTrue, scopes); expression(node.whenFalse, scopes); return; }
    if (ts.isCallExpression(node) && !node.questionDotToken && !node.typeArguments?.length) {
      const callee = unwrapped(node.expression);
      const log = ts.isPropertyAccessExpression(callee) && !callee.questionDotToken && ts.isIdentifier(callee.expression) && callee.expression.text === 'console' && callee.name.text === 'log';
      if (ts.isElementAccessExpression(callee) || callee.questionDotToken || node.arguments.length > 20) fail(node);
      if (!log) expression(callee, scopes);
      for (const arg of node.arguments) expression(arg, scopes); return;
    }
    fail(node);
  }
  function scopeFor(statements, label, extras = [], allowFunctions = false) {
    const names = [], bindings = new Map(), imports = new Map();
    const add = (node, kind) => {
      const name = bindingName(node);
      if (bindings.has(name)) { if (kind === 'function' && bindings.get(name) === 'function') fail(node); throw new Error('Syntaxfehler: doppelte lexikalische Bindung ' + name); }
      names.push(name); bindings.set(name, kind);
    };
    for (const node of extras) add(node, 'parameter');
    for (const statement of statements) {
      if (moduleContext && ts.isImportDeclaration(statement)) {
        const clause = statement.importClause;
        if (clause?.name) add(clause.name, 'import');
        if (clause?.name) imports.set(clause.name.text, { imported: 'default', from: statement.moduleSpecifier.text });
        if (clause?.namedBindings && ts.isNamespaceImport(clause.namedBindings)) add(clause.namedBindings.name, 'import');
        if (clause?.namedBindings && ts.isNamespaceImport(clause.namedBindings)) imports.set(clause.namedBindings.name.text, { namespace: true, from: statement.moduleSpecifier.text });
        for (const item of clause?.namedBindings?.elements || []) { add(item.name, 'import'); imports.set(item.name.text, { imported: item.propertyName?.text || item.name.text, from: statement.moduleSpecifier.text }); }
      }
      if (ts.isVariableStatement(statement)) for (const declaration of statement.declarationList.declarations) {
        if (declaration.type || declaration.exclamationToken) fail(declaration);
        add(declaration.name, 'variable');
      }
      if (ts.isFunctionDeclaration(statement)) {
        if (!allowFunctions || !statement.name) fail(statement);
        add(statement.name, 'function');
      }
    }
    return { id: scopeId++, label, names, bindings, imports, ownerFunctionId: 0 };
  }
  const publicScope = (scope, context) => ({ id: scope.id, label: scope.label, names: scope.names, captured: scope.ownerFunctionId !== context.functionId });
  const readers = scope => '__azubi_dbg_scope_' + scope.id;
  const capture = scope => '[' + scope.names.map(name => '[' + JSON.stringify(name) + ',()=>'+ name + ']').join(',') + ']';
  const declaration = scope => 'const ' + readers(scope) + '=' + capture(scope) + ';\n';
  const inlineScopes = scopes => '[' + scopes.map(scope => '[' + scope.id + ',' + capture(scope) + ']').join(',') + ']';
  function metadata(node, scopes, context, end = false, kind = 'statement', atEnd = false) {
    const offset = end ? file.end : atEnd ? node.end - 1 : node.getStart(file);
    const pos = file.getLineAndCharacterOfPosition(offset);
    const data = { id: points.length, file: draft.name, line: pos.line + 1, column: pos.character + 1, end, kind, functionId: context.functionId, scopes: scopes.map(scope=>publicScope(scope, context)) };
    points.push(data); if (points.length > limits.points) throw new Error('Zu viele Debugpositionen.');
    return data;
  }
  function point(node, scopes, context, end = false, kind = 'statement', atEnd = false) {
    const data = metadata(node, scopes, context, end, kind, atEnd);
    return 'var __azubi_dbg_tick=' + helper + '(' + data.id + ',[' + scopes.map(scope => '[' + scope.id + ',' + readers(scope) + ']').join(',') + ']);\n';
  }
  function render(node, scopes, context, validate = true) {
    if (validate) expression(node, scopes);
    function rewrite(current) {
      if (ts.isArrowFunction(current) || ts.isFunctionExpression(current)) {
        let parent=current.parent, value=current;while(ts.isParenthesizedExpression(parent)){value=parent;parent=parent.parent;}
        const callee=ts.isCallExpression(parent)?unwrapped(parent.expression):null;
        const callback=callee&&ts.isPropertyAccessExpression(callee)&&callbackMethods.has(callee.name.text)&&parent.arguments[0]===value;
        return '((' + scopes.map(readers).join(',') + ')=>' + helper + '.allowCallback(' + renderFunction(current, scopes, context, callback) + '))(' + scopes.map(capture).join(',') + ')';
      }
      if (ts.isNewExpression(current)) return helper + '.error(' + JSON.stringify(current.expression.text) + ',[' + (current.arguments || []).map(rewrite).join(',') + '])';
      if (ts.isPropertyAccessExpression(current) || ts.isElementAccessExpression(current)) {
        const key = ts.isPropertyAccessExpression(current) ? JSON.stringify(current.name.text) : rewrite(current.argumentExpression);
        return helper + '.ref(' + rewrite(current.expression) + ',' + key + ',' + !!context.strict + ').value';
      }
      if (ts.isCallExpression(current)) {
        const callee = unwrapped(current.expression);
        if (ts.isPropertyAccessExpression(callee) && ts.isIdentifier(callee.expression) && callee.expression.text==='console' && callee.name.text==='log') return 'console.log(' + current.arguments.map(rewrite).join(',') + ')';
        const meta = metadata(current, scopes, context, false, 'context');
        if (ts.isPropertyAccessExpression(callee)) return helper+'.bound('+meta.id+','+inlineScopes(scopes)+','+rewrite(callee.expression)+','+JSON.stringify(callee.name.text)+')('+current.arguments.map(rewrite).join(',')+')';
        return helper+'.call('+meta.id+','+inlineScopes(scopes)+','+rewrite(callee)+',['+current.arguments.map(rewrite).join(',')+'])';
      }
      const children = []; ts.forEachChild(current, child => { children.push(child); });
      let offset = current.getStart(file), text = '';
      for (const child of children) { text += draft.source.slice(offset, child.getStart(file)) + rewrite(child); offset = child.end; }
      return text + draft.source.slice(offset, current.end);
    }
    return rewrite(node);
  }
  function variableList(list, scopes, context, emit = true) {
    if (!(list.flags & (ts.NodeFlags.Const | ts.NodeFlags.Let))) fail(list);
    for (const item of list.declarations) {
      bindingName(item.name); if (item.type || item.exclamationToken) fail(item);
      if (item.initializer) expression(item.initializer, scopes);
      else if (list.flags & ts.NodeFlags.Const) throw new Error('Syntaxfehler: const benötigt einen Startwert.');
    }
    return emit ? render(list, scopes, context, false) : '';
  }
  const childScopes = (scopes, scope) => {
    if (scopes.length + 1 > limits.scopes) throw new Error('Scope-Grenze erreicht.');
    return [...scopes, scope];
  };
  function block(node, scopes, context, iteration = false, handler = null) {
    const scope = scopeFor(node.statements, (handler || 'Block') + ' ' + (file.getLineAndCharacterOfPosition(node.getStart(file)).line + 1));
    scope.ownerFunctionId = context.functionId;
    const inner = childScopes(scopes, scope);
    return '{\n' + (handler ? helper + '.guard();\n' : '') + declaration(scope) + (handler ? point(node, inner, context, false, handler === 'Catch' ? 'catch' : 'finally') : iteration ? point(node, inner, context, false, 'iteration') : '') + node.statements.map(child => statement(child, inner, context)).join('\n') + '\n}';
  }
  function body(node, scopes, context) {
    if (ts.isVariableStatement(node) || ts.isFunctionDeclaration(node)) throw new Error('Syntaxfehler: Deklarationen benötigen hier einen eigenen Block.');
    return ts.isBlock(node) ? block(node, scopes, context) : '{\n' + statement(node, scopes, context) + '\n}';
  }
  function loopBody(node, scopes, context, scope = null) {
    const inner = scope ? childScopes(scopes, scope) : scopes;
    const ctx = { ...context, loops: context.loops + 1 };
    return '{\n' + (scope ? declaration(scope) : '') + (ts.isBlock(node) ? block(node, inner, ctx, true) : point(node, inner, ctx, false, 'iteration') + body(node, inner, ctx)) + '\n}';
  }
  function renderFunction(node, scopes, context, callback = false) {
    if (node.modifiers?.length && !exportModifiers(node) || node.asteriskToken || !node.body || node.type || node.typeParameters?.length) fail(node);
    for (const parameter of node.parameters) if (parameter.dotDotDotToken || parameter.initializer || parameter.type || parameter.questionToken || parameter.modifiers?.length) fail(parameter);
    const parameterNames = new Set();
    for (const parameter of node.parameters) { const name = bindingName(parameter.name); if (parameterNames.has(name)) fail(parameter); parameterNames.add(name); }
    const pos = file.getLineAndCharacterOfPosition(node.getStart(file));
    const isDeclaration=ts.isFunctionDeclaration(node);
    if (!isDeclaration && node.name) fail(node);
    const inferred=ts.isVariableDeclaration(node.parent)&&ts.isIdentifier(node.parent.name)?node.parent.name.text:`Closure ${pos.line+1}:${pos.character+1}`;
    const id = functions.length, name = callback ? `Callback ${pos.line+1}:${pos.character+1}` : isDeclaration?node.name.text:inferred; functions.push({ id, name, file: draft.name });
    const isBlock = ts.isBlock(node.body);
    const scope = scopeFor(isBlock ? node.body.statements : [], callback ? name : 'Funktion ' + name, node.parameters.map(param => param.name));
    scope.ownerFunctionId = id;
    const inner = childScopes(scopes, scope), ctx = { functionId: id, loops: 0, strict: context.strict };
    const statements = isBlock ? [...node.body.statements] : []; let directives = '';
    while (statements[0] && ts.isExpressionStatement(statements[0]) && ts.isStringLiteral(statements[0].expression)) { const directive = statements.shift(); if (['"use strict"', "'use strict'"].includes(directive.expression.getText(file))) ctx.strict = true; directives += directive.getText(file) + ';\n'; }
    const params = node.parameters.map(param => param.name.getText(file)).join(',');
    const exported = isDeclaration && node.modifiers?.length ? node.modifiers.map(item => item.getText(file)).join(' ') + ' ' : '';
    const head = isDeclaration ? exported + 'function ' + name + '(' + params + ')' : ts.isArrowFunction(node) ? '(' + params + ')=>' : 'function(' + params + ')';
    let body;
    if (isBlock) body = point(node.body, inner, ctx, false, 'entry') + statements.map(child => statement(child, inner, ctx)).join('\n') + '\n' + point(node.body, inner, ctx, false, 'return', true);
    else { expression(node.body, inner); body = point(node, inner, ctx, false, 'entry') + point(node.body, inner, ctx, false, 'return') + 'return (' + render(node.body, inner, ctx, false) + ');'; }
    return head + '{\n' + directives + 'const __azubi_dbg_frame=' + helper + '.enter(' + id + ');try{\n' + declaration(scope) + body + '\n}finally{' + helper + '.leave(__azubi_dbg_frame);}\n}';
  }
  function statement(node, scopes, context) {
    if (moduleContext && scopes.length === 1 && !context.functionId) {
      if (ts.isImportDeclaration(node)) return node.getText(file) + ';';
      if (ts.isExportDeclaration(node)) {
        if (node.exportClause && ts.isNamespaceExport(node.exportClause)) bindingName(node.exportClause.name);
        else for (const item of node.exportClause?.elements || []) { const local = bindingName(item.propertyName || item.name); bindingName(item.name); if (!node.moduleSpecifier && !resolve(local, scopes)) fail(item); }
        // ParseModule treats exports of imports as indirect exports. Emit that
        // equivalent native form explicitly: QuickJS 0.32 otherwise mistakes
        // the intermediate imported local for a new binding in star diamonds.
        if (!node.moduleSpecifier && node.exportClause && ts.isNamedExports(node.exportClause)) return node.exportClause.elements.map(item => {
          const local = (item.propertyName || item.name).text, key = item.name.text, imported = scopes[0].imports.get(local);
          if (!imported) return 'export {' + local + ' as ' + key + '};';
          if (imported.namespace) return 'export * as ' + key + ' from ' + JSON.stringify(imported.from) + ';';
          return 'export {' + imported.imported + ' as ' + key + '} from ' + JSON.stringify(imported.from) + ';';
        }).join('\n');
        return node.getText(file) + ';';
      }
      if (ts.isExportAssignment(node)) { if (node.isExportEquals) fail(node); expression(node.expression, scopes); return point(node, scopes, context) + 'export default (' + render(node.expression, scopes, context, false) + ');'; }
    }
    if (ts.isBlock(node)) return block(node, scopes, context);
    if (ts.isTryStatement(node)) {
      const protectedBlock = code => '{try' + code + 'catch(__azubi_dbg_exception){' + helper + '.failure(__azubi_dbg_exception);throw __azubi_dbg_exception;}}';
      let caught = '';
      if (node.catchClause) {
        const variable = node.catchClause.variableDeclaration;
        if (variable && (variable.type || variable.initializer || variable.exclamationToken)) fail(variable);
        const scope = scopeFor([], 'Catchbindung ' + (file.getLineAndCharacterOfPosition(node.catchClause.getStart(file)).line + 1), variable ? [variable.name] : []);
        scope.ownerFunctionId = context.functionId;
        const inner = childScopes(scopes, scope);
        // Keep the parameter environment outside the original block environment:
        // same-name let in that block is an early error in native JavaScript.
        if (variable) for (const child of node.catchClause.block.statements) if (ts.isVariableStatement(child)) for (const item of child.declarationList.declarations) if (ts.isIdentifier(item.name) && item.name.text === variable.name.text) throw new Error('Syntaxfehler: doppelte Catchbindung.');
        const body = block(node.catchClause.block, inner, context, false, 'Catch');
        caught = 'catch' + (variable ? '(' + variable.name.getText(file) + ')' : '') + protectedBlock('{\n' + helper + '.guard();\n' + declaration(scope) + body + '\n}');
      }
      return point(node, scopes, context) + 'try' + protectedBlock(block(node.tryBlock, scopes, context)) + caught + (node.finallyBlock ? 'finally' + protectedBlock(block(node.finallyBlock, scopes, context, false, 'Finally')) : '');
    }
    if (ts.isThrowStatement(node)) {
      if (!node.expression) fail(node);
      expression(node.expression, scopes);
      return point(node, scopes, context, false, 'throw') + 'throw (' + render(node.expression, scopes, context, false) + ');';
    }
    if (ts.isVariableStatement(node)) {
      if (node.modifiers?.length && !(scopes.length === 1 && !context.functionId && exportModifiers(node) && node.modifiers.every(item => item.kind === ts.SyntaxKind.ExportKeyword))) fail(node);
      variableList(node.declarationList, scopes, context, false);
      return point(node, scopes, context) + render(node, scopes, context, false) + ';';
    }
    if (ts.isExpressionStatement(node)) { expression(node.expression, scopes); return point(node, scopes, context) + render(node.expression, scopes, context, false) + ';'; }
    if (ts.isIfStatement(node)) {
      expression(node.expression, scopes);
      return point(node, scopes, context) + 'if(' + render(node.expression, scopes, context, false) + ')' + body(node.thenStatement, scopes, context) + (node.elseStatement ? 'else' + body(node.elseStatement, scopes, context) : '');
    }
    if (ts.isWhileStatement(node) || ts.isDoStatement(node)) {
      expression(node.expression, scopes);
      return point(node, scopes, context) + (ts.isWhileStatement(node) ? 'while(' + render(node.expression, scopes, context, false) + ')' + loopBody(node.statement, scopes, context) : 'do' + loopBody(node.statement, scopes, context) + 'while(' + render(node.expression, scopes, context, false) + ');');
    }
    if (ts.isForStatement(node) || ts.isForOfStatement(node)) {
      const isOf = ts.isForOfStatement(node); if (node.awaitModifier) fail(node);
      let scope = null, init = '';
      if (node.initializer && ts.isVariableDeclarationList(node.initializer)) {
        scope = scopeFor([ts.factory.createVariableStatement(undefined, node.initializer)], 'Schleife ' + (file.getLineAndCharacterOfPosition(node.getStart(file)).line + 1));
        scope.ownerFunctionId = context.functionId;
        const inner = childScopes(scopes, scope);
        if (isOf) {
          if (!(node.initializer.flags & (ts.NodeFlags.Const | ts.NodeFlags.Let)) || node.initializer.declarations.length !== 1 || node.initializer.declarations[0].initializer) fail(node);
          init = node.initializer.getText(file);
        } else init = variableList(node.initializer, inner, context);
      } else if (node.initializer) {
        if (isOf) reference(node.initializer, scopes); else expression(node.initializer, scopes);
        init = render(node.initializer, scopes, context, false);
      }
      const inner = scope ? childScopes(scopes, scope) : scopes;
      if (isOf) expression(node.expression, inner);
      else { if (node.condition) expression(node.condition, inner); if (node.incrementor) expression(node.incrementor, inner); }
      const header = isOf ? init + ' of ' + render(node.expression, inner, context, false) : init + ';' + (node.condition ? render(node.condition, inner, context, false) : '') + ';' + (node.incrementor ? render(node.incrementor, inner, context, false) : '');
      return point(node, scopes, context) + 'for(' + header + ')' + loopBody(node.statement, scopes, context, scope);
    }
    if (ts.isBreakStatement(node) || ts.isContinueStatement(node)) {
      if (!context.loops || node.label) fail(node);
      return point(node, scopes, context) + node.getText(file) + ';';
    }
    if (ts.isReturnStatement(node)) {
      if (!context.functionId) throw new Error('Syntaxfehler: return benötigt eine Funktion.');
      if (node.expression) expression(node.expression, scopes);
      return point(node, scopes, context, false, 'return') + 'return' + (node.expression ? ' (' + render(node.expression, scopes, context, false) + ')' : '') + ';';
    }
    if (ts.isFunctionDeclaration(node)) {
      if (context.functionId || scopes.length !== 1 || node.modifiers?.length && !exportModifiers(node) || node.asteriskToken || !node.name || !node.body || node.type || node.typeParameters?.length) fail(node);
      return renderFunction(node, scopes, context);
    }
    if (ts.isEmptyStatement(node)) return ';';
    fail(node);
  }
  const root = scopeFor(file.statements, moduleContext ? 'Modul ' + draft.name : 'Programm', [], true), context = { functionId: 0, loops: 0, strict: !!moduleContext };
  const statements = [...file.statements]; let directives = '';
  while (statements[0] && ts.isExpressionStatement(statements[0]) && ts.isStringLiteral(statements[0].expression)) { const directive = statements.shift(); if (['"use strict"', "'use strict'"].includes(directive.expression.getText(file))) context.strict = true; directives += directive.getText(file) + ';\n'; }
  const registered = root.names.filter(name => root.bindings.get(name) === 'function').map(name => 'var __azubi_dbg_registered=' + helper + '.allowCallback(' + name + ');\n').join('');
  const staticDependency = node => !!moduleContext && (ts.isImportDeclaration(node) || ts.isExportDeclaration(node) && !!node.moduleSpecifier);
  // Preserve original RequestedModules order before any lowered local export
  // can introduce a direct reexport earlier than its original import.
  const dependencies = statements.filter(staticDependency).map(node => statement(node, [root], context)).join('\n');
  const namespaceStars = (moduleContext?.namespaceExports.get(draft.name) || []).map(item => 'export {' + item.key + '} from ' + JSON.stringify(item.from) + ';').join('\n');
  const code = directives + dependencies + '\n' + namespaceStars + '\n' + declaration(root) + registered + statements.filter(node => !staticDependency(node)).map(node => statement(node, [root], context)).join('\n') + '\n' + (!moduleContext || moduleContext.entry === draft.name ? point(file, [root], context, true) : '');
  if (encodedSize(code) > limits.generatedBytes) throw new Error('Generierter Debugcode zu groß.');
  if (moduleContext) moduleContext.scopeId = scopeId;
  return { schema: 1, name: draft.name, code, helper, points, functions, stats: { nodes, maxDepth, generatedBytes: encodedSize(code) } };
}

export function compileDebugProject(input, overrides, options={}) {
  const project = checkDebugProject(input), limits = debuggerLimits(overrides);
  if (Object.values(project.files).reduce((sum, source) => sum + encodedSize(source), 0) > limits.sourceBytes || Object.values(project.files).reduce((sum, source) => sum + debugSourceLines(source).length, 0) > limits.sourceLines) throw new Error('Projektweite Quelltext-/Zeilengrenze erreicht.');
  const namespaceExports = checkModuleGraph(project);
  const shared = { entry: project.entry, points: [], functions: [{ id: 0, name: 'Programm' }], scopeId: 0, namespaceExports, dom:options.dom===true }, modules = {};
  let nodes = 0, generatedBytes = 0, maxDepth = 0;
  for (const [name, source] of Object.entries(project.files)) {
    try {
      const artifact = compileDebugger({ schema: 1, name, source }, limits, shared);
      modules[name] = artifact.code; nodes += artifact.stats.nodes; generatedBytes += artifact.stats.generatedBytes; maxDepth = Math.max(maxDepth, artifact.stats.maxDepth);
    } catch (error) { throw new Error(name + ': ' + error.message); }
  }
  if (nodes > limits.astNodes || generatedBytes > limits.generatedBytes) throw new Error('Projektweite AST-/Codegrenze erreicht.');
  if(options.dom){if(shared.points.length>=limits.points)throw new Error('Zu viele Debugpositionen.');shared.points.push({id:shared.points.length,file:project.entry,line:1,column:1,end:false,kind:'context',functionId:0,scopes:[],synthetic:true});}
  return { schema: 1, mode: 'module', name: project.entry, code: modules[project.entry], modules, sources: project.files, helper: '__azubi_dbg_checkpoint', points: shared.points, functions: shared.functions, stats: { nodes, maxDepth, generatedBytes } };
}

function checkModuleGraph(project) {
  const records = new Map(), requests = [];
  for (const [name, source] of Object.entries(project.files)) {
    const file = ts.createSourceFile(name, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
    if (file.parseDiagnostics.length) throw new Error('Syntaxfehler in ' + name + ': ' + ts.flattenDiagnosticMessageText(file.parseDiagnostics[0].messageText, ' '));
    const record = { deps: [], explicit: new Map(), stars: [], imports: new Map() };
    const add = (key, binding) => { if (record.explicit.has(key)) throw new Error('Doppelter Export in ' + name + ': ' + key); record.explicit.set(key, binding); };
    const dependency = node => {
      if (!node.moduleSpecifier || !ts.isStringLiteral(node.moduleSpecifier) || node.attributes) throw new Error('Modulsyntax in ' + name + ' noch nicht unterstützt.');
      const dep = resolveDebugImport(name, node.moduleSpecifier.text, project.files); record.deps.push(dep); return dep;
    };
    for (const node of file.statements) {
      if (ts.isImportDeclaration(node)) {
        const dep = dependency(node), clause = node.importClause;
        if (clause?.isTypeOnly) throw new Error('Type-Imports sind nicht unterstützt.');
        if (clause?.name) { record.imports.set(clause.name.text, { dep, key: 'default' }); requests.push({ file: name, dep, key: 'default' }); }
        if (clause?.namedBindings && ts.isNamespaceImport(clause.namedBindings)) record.imports.set(clause.namedBindings.name.text, { dep, namespace: true });
        else for (const item of clause?.namedBindings?.elements || []) {
          if (item.isTypeOnly || item.propertyName && !ts.isIdentifier(item.propertyName)) throw new Error('Importsyntax noch nicht unterstützt.');
          const key = item.propertyName?.text || item.name.text;
          record.imports.set(item.name.text, { dep, key }); requests.push({ file: name, dep, key });
        }
      } else if (ts.isExportDeclaration(node)) {
        if (node.isTypeOnly || node.attributes) throw new Error('Exportsyntax noch nicht unterstützt.');
        const dep = node.moduleSpecifier ? dependency(node) : null;
        if (!node.exportClause) { if (!dep) throw new Error('Sternexport ohne Modul.'); record.stars.push({ dep, from: node.moduleSpecifier.text }); }
        else if (ts.isNamespaceExport(node.exportClause)) { if (!dep || !ts.isIdentifier(node.exportClause.name)) throw new Error('Namespace-Export noch nicht unterstützt.'); add(node.exportClause.name.text, { dep, namespace: true }); }
        else for (const item of node.exportClause.elements) {
          if (item.isTypeOnly || !ts.isIdentifier(item.name) || item.propertyName && !ts.isIdentifier(item.propertyName)) throw new Error('Exportsyntax noch nicht unterstützt.');
          add(item.name.text, dep ? { dep, key: item.propertyName?.text || item.name.text } : { local: item.propertyName?.text || item.name.text });
        }
      } else if (ts.isExportAssignment(node)) { if (node.isExportEquals) throw new Error('export = ist nicht unterstützt.'); add('default', { local: '*default*' }); }
      else if (node.modifiers?.some(item => item.kind === ts.SyntaxKind.ExportKeyword)) {
        if (node.modifiers.some(item => item.kind === ts.SyntaxKind.DefaultKeyword)) add('default', { local: ts.isFunctionDeclaration(node) && node.name ? node.name.text : '*default*' });
        else if (ts.isFunctionDeclaration(node) && node.name) add(node.name.text, { local: node.name.text });
        else if (ts.isVariableStatement(node)) for (const item of node.declarationList.declarations) { if (!ts.isIdentifier(item.name)) throw new Error('Exportbindung noch nicht unterstützt.'); add(item.name.text, { local: item.name.text }); }
        else throw new Error('Exportsyntax noch nicht unterstützt.');
      }
    }
    records.set(name, record);
  }
  const visiting = new Set(), visited = new Set(), order = [];
  function visit(name) {
    if (visiting.has(name)) throw new Error('Kreisimporte sind noch nicht unterstützt: ' + name);
    if (visited.has(name)) return;
    visiting.add(name); for (const dep of records.get(name).deps) visit(dep); visiting.delete(name); visited.add(name); order.push(name);
  }
  for (const name of records.keys()) visit(name);
  const ambiguous = Symbol('ambiguous'), exports = new Map(), namespaceExports = new Map();
  const requireExport = (dep, key, from) => {
    const origin = exports.get(dep)?.get(key);
    if (origin === undefined) throw new Error('Export ' + key + ' fehlt in ' + dep + ' (Import in ' + from + ').');
    if (origin === ambiguous) throw new Error('Mehrdeutiger Export ' + key + ' in ' + dep + ' (Import in ' + from + ').');
    return origin;
  };
  for (const name of order) {
    const record = records.get(name), result = new Map();
    for (const [key, binding] of record.explicit) {
      const reference = binding.local ? record.imports.get(binding.local) || binding : binding;
      const origin = reference.namespace ? reference.dep + ':namespace' : reference.dep ? requireExport(reference.dep, reference.key, name) : name + ':binding:' + reference.local;
      result.set(key, origin);
    }
    for (const {dep} of record.stars) for (const [key, origin] of exports.get(dep)) {
      if (key === 'default' || record.explicit.has(key)) continue;
      if (result.has(key) && result.get(key) !== origin) result.set(key, ambiguous); else result.set(key, origin);
    }
    exports.set(name, result);
    // Older engines give namespace reexports intermediate local identities.
    // Select a native indirect reexport only for a proven unambiguous namespace
    // binding; do not choose a winner for actually ambiguous star exports.
    const selected = new Map();
    for (const {dep,from} of record.stars) for (const [key,origin] of exports.get(dep)) {
      if (key !== 'default' && !record.explicit.has(key) && !selected.has(key) && typeof origin === 'string' && /^[^:]+:namespace$/.test(origin) && result.get(key) === origin) selected.set(key, { key, from });
    }
    namespaceExports.set(name, [...selected.values()]);
  }
  for (const request of requests) requireExport(request.dep, request.key, request.file);
  return namespaceExports;
}
