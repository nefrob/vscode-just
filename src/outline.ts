import * as vscode from 'vscode';

interface JustSymbol {
  /** Plain symbol name, e.g. `foo` (without any `@` prefix). */
  name: string;
  /** Name as shown in the outline, e.g. `@foo`. */
  displayName: string;
  kind: vscode.SymbolKind;
  detail?: string;
  startLine: number;
  endLine: number;
  /** 0-based column where `name` starts on `startLine`. */
  nameColumn: number;
}

// Optional recipe prefix (`@` makes a recipe quiet/private), name, params,
// then the header terminating `:` (explicitly not `:=`) and dependencies.
const RECIPE_HEADER = /^(@_|_@|@|_)?([a-zA-Z][a-zA-Z0-9_-]*)(\s+.*?)?\s*:(?!=)(.*)$/;

const ALIAS_PATTERN = /^alias\s+([a-zA-Z_][a-zA-Z0-9_-]*)\s*:=\s*(.+)$/;
const MODULE_PATTERN = /^mod\s+([a-zA-Z_][a-zA-Z0-9_-]*)/;
const IMPORT_PATTERN = /^import\s+/;
const SETTING_PATTERN = /^set\s+([a-zA-Z_][a-zA-Z0-9_-]*)/;
const FUNCTION_PATTERN = /^([a-zA-Z][a-zA-Z0-9_-]*)\s*\((.*?)\)\s*:=/;
const VARIABLE_PATTERN = /^(?:export\s+|unexport\s+)?([a-zA-Z_][a-zA-Z0-9_-]*)\s*:=/;

/**
 * Document symbol provider that powers the Outline view and breadcrumbs for
 * justfiles. It is built-in so the outline works even when `just-lsp` is not
 * installed.
 */
export class JustDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
  provideDocumentSymbols(document: vscode.TextDocument): vscode.DocumentSymbol[] {
    return parseJustfile(document.getText()).map((symbol) => {
      const range = new vscode.Range(symbol.startLine, 0, symbol.endLine, 0);
      const selectionRange = new vscode.Range(
        symbol.startLine,
        symbol.nameColumn,
        symbol.startLine,
        symbol.nameColumn + symbol.name.length,
      );

      return new vscode.DocumentSymbol(
        symbol.displayName,
        symbol.detail ?? '',
        symbol.kind,
        range,
        selectionRange,
      );
    });
  }
}

export const parseJustfile = (content: string): JustSymbol[] => {
  const lines = content.split(/\r?\n/);
  const symbols: JustSymbol[] = [];

  lines.forEach((line, index) => {
    const symbol = parseLine(line, index, lines);
    if (symbol) symbols.push(symbol);
  });

  return symbols;
};

const parseLine = (
  line: string,
  index: number,
  lines: string[],
): JustSymbol | undefined => {
  const trimmed = line.trim();

  if (trimmed.length === 0 || trimmed.startsWith('#')) return undefined;
  // Only top-level (column 0) constructs are shown in the outline.
  if (line.startsWith(' ') || line.startsWith('\t')) return undefined;

  // alias name := target
  const alias = ALIAS_PATTERN.exec(trimmed);
  if (alias) {
    return {
      name: alias[1],
      displayName: alias[1],
      kind: vscode.SymbolKind.Function,
      detail: `alias for ${alias[2].trim()}`,
      startLine: index,
      endLine: index,
      nameColumn: trimmed.indexOf(alias[1]),
    };
  }

  // mod name
  const mod = MODULE_PATTERN.exec(trimmed);
  if (mod) {
    return {
      name: mod[1],
      displayName: mod[1],
      kind: vscode.SymbolKind.Module,
      startLine: index,
      endLine: index,
      nameColumn: trimmed.indexOf(mod[1]),
    };
  }

  // imports are not shown in the outline
  if (IMPORT_PATTERN.test(trimmed)) return undefined;

  // set name := value
  const setting = SETTING_PATTERN.exec(trimmed);
  if (setting) {
    return {
      name: setting[1],
      displayName: setting[1],
      kind: vscode.SymbolKind.Property,
      startLine: index,
      endLine: index,
      nameColumn: trimmed.indexOf(setting[1]),
    };
  }

  // user-defined function foo(x, y) := ...
  const func = FUNCTION_PATTERN.exec(trimmed);
  if (func) {
    const params = func[2].trim();
    return {
      name: func[1],
      displayName: func[1],
      kind: vscode.SymbolKind.Function,
      detail: params ? `(${params})` : undefined,
      startLine: index,
      endLine: index,
      nameColumn: trimmed.indexOf(func[1]),
    };
  }

  // variable / assignment foo := ...
  const variable = VARIABLE_PATTERN.exec(trimmed);
  if (variable) {
    return {
      name: variable[1],
      displayName: variable[1],
      kind: vscode.SymbolKind.Variable,
      startLine: index,
      endLine: index,
      nameColumn: trimmed.indexOf(variable[1]),
    };
  }

  // recipe
  const recipe = RECIPE_HEADER.exec(trimmed);
  if (recipe) {
    const prefix = recipe[1] ?? '';
    const name = recipe[2];
    const params = recipe[3]?.trim() ?? '';
    return {
      name,
      displayName: `${prefix}${name}`,
      kind: vscode.SymbolKind.Function,
      detail: params || getDocComment(lines, index),
      startLine: index,
      endLine: getRecipeEndLine(lines, index),
      nameColumn: trimmed.indexOf(name),
    };
  }

  return undefined;
};

const getRecipeEndLine = (lines: string[], startLine: number): number => {
  let endLine = startLine;
  for (let i = startLine + 1; i < lines.length; i++) {
    const line = lines[i];
    // Blank lines may occur inside a recipe body; keep scanning past them.
    if (line.trim().length === 0) continue;
    if (line.startsWith(' ') || line.startsWith('\t')) {
      endLine = i;
    } else {
      break;
    }
  }
  return endLine;
};

const getDocComment = (lines: string[], headerLine: number): string | undefined => {
  // Doc comments are `#` lines immediately preceding the recipe header.
  for (let i = headerLine - 1; i >= 0; i--) {
    const trimmed = lines[i].trim();
    if (trimmed.length === 0) continue;
    if (!trimmed.startsWith('#')) break;
    const comment = trimmed.replace(/^#\s?/, '');
    if (comment.length > 0) return comment;
  }
  return undefined;
};
