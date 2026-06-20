import * as vscode from 'vscode';

/**
 * Regex to match recipe definitions in a justfile.
 * A recipe starts at column 0: name, optional params, then `:`.
 * Negative lookahead excludes `:=` (var/export assignments).
 * Captures the recipe name and whether it has parameters.
 */
const RECIPE_REGEX =
  /^([a-zA-Z_][a-zA-Z0-9_-]*)\s*((?:\+?[a-zA-Z_][a-zA-Z0-9_-]*(?:=("[^"]*"|'[^']*'|\S*))?\s*)*):(?!=)/gm;

export class RecipeCodeLensProvider
  implements vscode.CodeLensProvider, vscode.Disposable
{
  private emitter = new vscode.EventEmitter<void>();
  readonly onDidChangeCodeLenses = this.emitter.event;
  private subscription: vscode.Disposable;

  constructor() {
    this.subscription = vscode.workspace.onDidChangeTextDocument((e) => {
      if (e.document.languageId === 'just') {
        this.emitter.fire();
      }
    });
  }

  refresh(): void {
    this.emitter.fire();
  }

  provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
    const lenses: vscode.CodeLens[] = [];
    const justfilePath = document.uri.fsPath;

    for (const match of document.getText().matchAll(RECIPE_REGEX)) {
      const name = match[1];
      const hasParams = (match[2]?.trim() ?? '').length > 0;
      const range = document.lineAt(document.positionAt(match.index!).line).range;

      lenses.push(this.makeRunLens(range, name, justfilePath));

      if (hasParams) {
        lenses.push(this.makeRunWithArgsLens(range, name, justfilePath));
      }
    }

    return lenses;
  }

  dispose(): void {
    this.subscription.dispose();
    this.emitter.dispose();
  }

  private recipeArg(name: string, justfilePath: string) {
    return { name, doc: '', parameters: [], groups: [], justfilePath };
  }

  private makeRunLens(
    range: vscode.Range,
    name: string,
    justfilePath: string,
  ): vscode.CodeLens {
    return new vscode.CodeLens(range, {
      title: '▶ Run',
      command: 'vscode-just.runRecipeFromTree',
      arguments: [this.recipeArg(name, justfilePath)],
    });
  }

  private makeRunWithArgsLens(
    range: vscode.Range,
    name: string,
    justfilePath: string,
  ): vscode.CodeLens {
    return new vscode.CodeLens(range, {
      title: '▶ Run with args',
      command: 'vscode-just.runRecipeWithArgsFromTree',
      arguments: [this.recipeArg(name, justfilePath)],
    });
  }
}
