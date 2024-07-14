import { spawn } from 'child_process';
import * as vscode from 'vscode';

import Logger from './logger';

const EXTENSION_NAME = 'vscode-just';

let logger: Logger;

const formatWithExecutable = (fsPath: string) => {
  const justPath =
    (vscode.workspace.getConfiguration(EXTENSION_NAME).get('justPath') as string) ||
    'just';
  const args = ['-f', fsPath, '--fmt', '--unstable'];

  const childProcess = spawn(justPath, args);
  childProcess.stdout.on('data', (data: string) => {
    logger.info(data);
  });
  childProcess.stderr.on('data', (data: string) => {
    // TODO: successfully formatted documents also log to stderr
    // so treat everything as info for now
    logger.info(data);
    // showErrorWithLink('Error formatting document.');
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
  if (vscode.workspace.getConfiguration(EXTENSION_NAME).get('formatOnSave')) {
    formatWithExecutable(event.document.uri.fsPath);
  }
});

export const activate = (context: vscode.ExtensionContext) => {
  console.debug('Extension activated');
  logger = new Logger(EXTENSION_NAME);

  const disposable = vscode.commands.registerCommand('extension.formatOnSave', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      formatWithExecutable(editor.document.uri.fsPath);
    }
  });

  context.subscriptions.push(disposable);
};

export const deactivate = () => {
  console.debug('Extension deactivated');
  if (logger) {
    logger.dispose();
  }
};
