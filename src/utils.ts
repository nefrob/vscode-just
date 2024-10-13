import * as vscode from 'vscode';

import { EXTENSION_NAME, SETTINGS } from './const';
import { getLogger } from './logger';

const LOGGER = getLogger();

export const showErrorWithLink = (message: string) => {
  const outputButton = 'Output';
  vscode.window
    .showErrorMessage(message, outputButton)
    .then((selection) => selection === outputButton && LOGGER.show());
};

export const workspaceRoot = (): string => {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  return workspaceFolders && workspaceFolders.length > 0
    ? workspaceFolders[0].uri.fsPath
    : '~';
};

export const getJustPath = (): string => {
  return (
    (vscode.workspace
      .getConfiguration(EXTENSION_NAME)
      .get(SETTINGS.justPath) as string) || 'just'
  );
};
