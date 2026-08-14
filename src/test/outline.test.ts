import * as assert from 'assert';
import * as vscode from 'vscode';

import { JustDocumentSymbolProvider, parseJustfile } from '../outline';

suite('Just Document Symbols', () => {
  test('parses recipes with parameters', () => {
    const content = [
      'foo param1 param2:',
      '  echo {{param1}} {{param2}}',
      '',
      'bar:',
      '  echo bar',
    ].join('\n');

    const symbols = parseJustfile(content);

    assert.strictEqual(symbols.length, 2);
    assert.deepStrictEqual(symbols[0], {
      name: 'foo',
      displayName: 'foo',
      kind: vscode.SymbolKind.Function,
      detail: 'param1 param2',
      startLine: 0,
      endLine: 1,
      nameColumn: 0,
    });
    assert.deepStrictEqual(symbols[1], {
      name: 'bar',
      displayName: 'bar',
      kind: vscode.SymbolKind.Function,
      detail: undefined,
      startLine: 3,
      endLine: 4,
      nameColumn: 0,
    });
  });

  test('recipe ranges span the body and stop at the next top-level item', () => {
    const content = [
      'foo:',
      '  line one',
      '  line two',
      '',
      '  line three',
      'bar:',
      '  echo bar',
    ].join('\n');

    const symbols = parseJustfile(content);

    assert.strictEqual(symbols[0].name, 'foo');
    assert.strictEqual(symbols[0].startLine, 0);
    assert.strictEqual(symbols[0].endLine, 4);
    assert.strictEqual(symbols[1].name, 'bar');
    assert.strictEqual(symbols[1].startLine, 5);
  });

  test('tracks private and quiet recipe prefixes', () => {
    const symbols = parseJustfile('@foo:\n  echo foo\n');

    assert.strictEqual(symbols.length, 1);
    assert.strictEqual(symbols[0].name, 'foo');
    assert.strictEqual(symbols[0].displayName, '@foo');
    assert.strictEqual(symbols[0].nameColumn, 1);
  });

  test('parses aliases', () => {
    const symbols = parseJustfile('alias b := foo\n');

    assert.strictEqual(symbols.length, 1);
    assert.strictEqual(symbols[0].name, 'b');
    assert.strictEqual(symbols[0].kind, vscode.SymbolKind.Function);
    assert.strictEqual(symbols[0].detail, 'alias for foo');
  });

  test('parses modules', () => {
    const symbols = parseJustfile('mod foo\n');

    assert.strictEqual(symbols.length, 1);
    assert.strictEqual(symbols[0].name, 'foo');
    assert.strictEqual(symbols[0].kind, vscode.SymbolKind.Module);
  });

  test('parses variables, exports and settings', () => {
    const content = [
      'set tempdir := "/tmp"',
      'export MY_VAR := `./script`',
      'LOCAL := "hello"',
    ].join('\n');

    const symbols = parseJustfile(content);

    assert.strictEqual(symbols.length, 3);
    assert.strictEqual(symbols[0].name, 'tempdir');
    assert.strictEqual(symbols[0].kind, vscode.SymbolKind.Property);
    assert.strictEqual(symbols[1].name, 'MY_VAR');
    assert.strictEqual(symbols[1].kind, vscode.SymbolKind.Variable);
    assert.strictEqual(symbols[2].name, 'LOCAL');
    assert.strictEqual(symbols[2].kind, vscode.SymbolKind.Variable);
  });

  test('parses user-defined functions', () => {
    const symbols = parseJustfile('add(a, b) := a + b\n');

    assert.strictEqual(symbols.length, 1);
    assert.strictEqual(symbols[0].name, 'add');
    assert.strictEqual(symbols[0].kind, vscode.SymbolKind.Function);
    assert.strictEqual(symbols[0].detail, '(a, b)');
  });

  test('uses the doc comment as detail when there are no parameters', () => {
    const content = ['# Build the project', 'build:', '  cargo build'].join('\n');

    const symbols = parseJustfile(content);

    assert.strictEqual(symbols.length, 1);
    assert.strictEqual(symbols[0].name, 'build');
    assert.strictEqual(symbols[0].detail, 'Build the project');
  });

  test('ignores assignments inside recipe bodies', () => {
    const content = ['foo:', '  bar := "nested"', '  echo {{bar}}'].join('\n');

    const symbols = parseJustfile(content);

    assert.strictEqual(symbols.length, 1);
    assert.strictEqual(symbols[0].name, 'foo');
  });

  test('does not confuse variable values with recipes', () => {
    const symbols = parseJustfile('url := "http://example.com"\n');

    assert.strictEqual(symbols.length, 1);
    assert.strictEqual(symbols[0].name, 'url');
    assert.strictEqual(symbols[0].kind, vscode.SymbolKind.Variable);
  });

  test('ignores imports, attributes and comments', () => {
    const content = [
      "import 'utils.just'",
      '[confirm("Continue?")]',
      '# just a comment',
      '',
    ].join('\n');

    const symbols = parseJustfile(content);

    assert.strictEqual(symbols.length, 0);
  });

  test('parses empty and comment-only documents', () => {
    assert.deepStrictEqual(parseJustfile(''), []);
    assert.deepStrictEqual(parseJustfile('# only a comment\n\n'), []);
  });

  test('provider returns DocumentSymbols with correct ranges', async () => {
    const document = await vscode.workspace.openTextDocument({
      content: ['@deploy target="prod":', '  just build', 'bar:', '  echo bar'].join(
        '\n',
      ),
      language: 'just',
    });

    const symbols = new JustDocumentSymbolProvider().provideDocumentSymbols(document);

    assert.strictEqual(symbols.length, 2);

    const deploy = symbols[0];
    assert.strictEqual(deploy.name, '@deploy');
    assert.strictEqual(deploy.detail, 'target="prod"');
    assert.strictEqual(deploy.kind, vscode.SymbolKind.Function);
    assert.deepStrictEqual(deploy.range, new vscode.Range(0, 0, 1, 0));
    assert.deepStrictEqual(deploy.selectionRange, new vscode.Range(0, 1, 0, 7));

    const bar = symbols[1];
    assert.strictEqual(bar.name, 'bar');
    assert.deepStrictEqual(bar.range, new vscode.Range(2, 0, 3, 0));
    assert.deepStrictEqual(bar.selectionRange, new vscode.Range(2, 0, 2, 3));
  });
});
