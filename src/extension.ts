import * as vscode from 'vscode';

import { COMMANDS, EXTENSION_NAME, SETTINGS } from './const';
import { formatWithExecutable } from './format';
import { runRecipeCommand } from './recipe';

export const activate = (context: vscode.ExtensionContext) => {
  console.debug(`${EXTENSION_NAME} activated`);

  const formatDisposable = vscode.commands.registerCommand(
    `${EXTENSION_NAME}.${COMMANDS.formatDocument}`,
    () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        formatWithExecutable(editor.document.uri.fsPath);
      }
    },
  );
  context.subscriptions.push(formatDisposable);

  const runRecipeDisposable = vscode.commands.registerCommand(
    `${EXTENSION_NAME}.${COMMANDS.runRecipe}`,
    async () => {
      runRecipeCommand();
    },
  );
  context.subscriptions.push(runRecipeDisposable);
};

export const deactivate = () => {
  console.debug(`${EXTENSION_NAME} deactivated`);
};

vscode.workspace.onWillSaveTextDocument((event) => {
  if (vscode.workspace.getConfiguration(EXTENSION_NAME).get(SETTINGS.formatOnSave)) {
    formatWithExecutable(event.document.uri.fsPath);
  }
});
