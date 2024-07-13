import { spawn } from 'child_process';
import * as vscode from 'vscode';
import Logger from './logger';

let logger: Logger;

const formatWithExecutable = (fsPath: string) => {
  const justPath =
    (vscode.workspace.getConfiguration('vscode-just').get('justPath') as string) ||
    'just';
  const args = ['-f', fsPath, '--fmt', '--unstable'];

  const childProcess = spawn(justPath, args);
  childProcess.stdout.on('data', (data: string) => {
    logger.info(data);
  });
  childProcess.stderr.on('data', (data: string) => {
    logger.error(data);
    showErrorWithLink('Error formatting document.');
  });
  childProcess.on('close', (code) => {
    console.debug(`just --fmt exited with ${code}`);
  });
};

const showErrorWithLink = (message: string) => {
  const outputButton = 'Output';
  vscode.window
    .showErrorMessage(message, outputButton)
    .then((selection) => selection === outputButton && logger.show());
};

vscode.workspace.onWillSaveTextDocument((event) => {
  if (vscode.workspace.getConfiguration('vscode-just').get('formatOnSave')) {
    formatWithExecutable(event.document.uri.fsPath);
  }
});

export const activate = (context: vscode.ExtensionContext) => {
  logger = new Logger('vscode-just');

  const disposable = vscode.commands.registerCommand('extension.formatOnSave', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      formatWithExecutable(editor.document.uri.fsPath);
    }
  });

  context.subscriptions.push(disposable);
};

export const deactivate = () => {
  if (logger) {
    logger.dispose();
  }
};
