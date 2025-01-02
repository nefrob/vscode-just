import * as vscode from 'vscode';

import { EXTENSION_NAME } from './const';
import { getJustPath } from './utils';

export const getDefaultRecipeTask = () => {
  const runDefaultRecipeTask = new vscode.Task(
    { type: EXTENSION_NAME },
    vscode.TaskScope.Workspace,
    'Run default recipe',
    'just',
    getRecipeTaskExecutor(),
  );
  runDefaultRecipeTask.presentationOptions = {
    showReuseMessage: false,
    close: false,
  };

  return runDefaultRecipeTask;
};

export const getRecipeTaskExecutor = (file?: string, recipe?: string) => {
  const args = [];
  if (file) args.push('-f', file);
  if (recipe) args.push(recipe);
  return new vscode.ShellExecution(getJustPath(), args);
};
