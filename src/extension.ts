import * as vscode from 'vscode';

import { COMMANDS, EXTENSION_NAME } from './const';
import { formatJustfileTempFile } from './format';
import { getLauncher } from './launcher';
import { getLogger } from './logger';
import { runRecipeCommand } from './recipe';
import { TaskProvider } from './tasks';

export const activate = (context: vscode.ExtensionContext) => {
  console.debug(`${EXTENSION_NAME} activated`);

  const documentFormatProviderDisposable =
    vscode.languages.registerDocumentFormattingEditProvider('just', {
      async provideDocumentFormattingEdits(
        document: vscode.TextDocument,
      ): Promise<vscode.TextEdit[] | undefined> {
        try {
          const formattedText = await formatJustfileTempFile(document.getText());
          const fullRange = new vscode.Range(0, 0, document.lineCount, 0);
          return [vscode.TextEdit.replace(fullRange, formattedText)];
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          vscode.window.showErrorMessage(`Failed to format justfile: ${message}`);
          return [];
        }
      },
    });
  context.subscriptions.push(documentFormatProviderDisposable);

  context.subscriptions.push(
    vscode.commands.registerCommand(COMMANDS.formatDocument, () => {
      const editor = vscode.window.activeTextEditor;
      if (editor && editor.document.languageId === 'just') {
        vscode.commands.executeCommand('editor.action.formatDocument');
      }
    }),
  );

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
