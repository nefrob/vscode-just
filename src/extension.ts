import * as vscode from 'vscode';

import { COMMANDS, EXTENSION_NAME, SETTINGS } from './const';
import { formatWithExecutable } from './format';
import { getLauncher } from './launcher';
import { getLogger } from './logger';
import { runRecipeCommand } from './recipe';
import { TaskProvider } from './tasks';

export const activate = (context: vscode.ExtensionContext) => {
  console.debug(`${EXTENSION_NAME} activated`);

  const formatDisposable = vscode.commands.registerCommand(
    COMMANDS.formatDocument,
    () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        formatWithExecutable(editor.document.uri.fsPath);
      }
    },
  );
  context.subscriptions.push(formatDisposable);

  const runRecipeDisposable = vscode.commands.registerCommand(
    COMMANDS.runRecipe,
    async () => {
      runRecipeCommand();
    },
  );
  context.subscriptions.push(runRecipeDisposable);

  context.subscriptions.push(
    vscode.tasks.registerTaskProvider(EXTENSION_NAME, new TaskProvider()),
  );
};

export const deactivate = () => {
  console.debug(`${EXTENSION_NAME} deactivated`);
  getLogger().dispose();
  getLauncher().dispose();
};

vscode.workspace.onWillSaveTextDocument((event) => {
  if (vscode.workspace.getConfiguration(EXTENSION_NAME).get(SETTINGS.formatOnSave)) {
    formatWithExecutable(event.document.uri.fsPath);
  }
});
