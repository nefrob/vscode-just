import * as vscode from 'vscode';

import { EXTENSION_NAME } from './const';
import { formatWithExecutable } from './format';
import Logger from './logger';
import { runRecipeCommand } from './recipe';

export let LOGGER: Logger;

export const activate = (context: vscode.ExtensionContext) => {
  console.debug(`${EXTENSION_NAME} activated`);
  LOGGER = new Logger(EXTENSION_NAME);

  const formatDisposable = vscode.commands.registerCommand(
    `${EXTENSION_NAME}.formatDocument`,
    () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        formatWithExecutable(editor.document.uri.fsPath);
      }
    },
  );
  context.subscriptions.push(formatDisposable);

  const runRecipeDisposable = vscode.commands.registerCommand(
    `${EXTENSION_NAME}.runRecipe`,
    async () => {
      runRecipeCommand();
    },
  );
  context.subscriptions.push(runRecipeDisposable);
};

export const deactivate = () => {
  console.debug(`${EXTENSION_NAME} deactivated`);
  if (LOGGER) {
    LOGGER.dispose();
  }
};

vscode.workspace.onWillSaveTextDocument((event) => {
  if (vscode.workspace.getConfiguration(EXTENSION_NAME).get('formatOnSave')) {
    formatWithExecutable(event.document.uri.fsPath);
  }
});
