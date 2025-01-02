import * as vscode from 'vscode';

import { EXTENSION_NAME } from './const';
import { getJustPath } from './utils';

export interface TaskDefinition extends vscode.TaskDefinition {
  file?: string;
  recipe?: string;
}

export class TaskProvider implements vscode.TaskProvider {
  public constructor() {}

  public provideTasks() {
    return [getDefaultRecipeTask()];
  }

  public resolveTask(_task: vscode.Task) {
    if (_task.definition.type !== EXTENSION_NAME) return undefined;

    const definition = _task.definition as TaskDefinition;
    _task.execution = getRecipeTaskExecutor(definition.file, definition.recipe);

    return new vscode.Task(
      definition,
      _task.scope ?? vscode.TaskScope.Workspace,
      definition.label ?? 'Run recipe',
      definition.type,
      getRecipeTaskExecutor(definition.file, definition.recipe),
    );
  }
}

export const getDefaultRecipeTask = () => {
  const runDefaultRecipeTask = new vscode.Task(
    { type: EXTENSION_NAME },
    vscode.TaskScope.Workspace,
    'Run default recipe',
    EXTENSION_NAME,
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
