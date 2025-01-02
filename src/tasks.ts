import * as vscode from 'vscode';

import { EXTENSION_NAME } from './const';
import { getJustPath } from './utils';

export interface TaskDefinition extends vscode.TaskDefinition {
  task: string;
  args?: string[];
}

export class TaskProvider implements vscode.TaskProvider {
  public constructor() {}

  public provideTasks() {
    return [getDefaultRecipeTask()];
  }

  public resolveTask(_task: vscode.Task) {
    if (_task.definition.type !== EXTENSION_NAME) return undefined;

    const definition = _task.definition as TaskDefinition;

    return new vscode.Task(
      definition,
      _task.scope ?? vscode.TaskScope.Workspace,
      definition.label ?? 'Run recipe',
      definition.type,
      new vscode.ShellExecution(definition.task, definition.args ?? []),
    );
  }
}

export const getDefaultRecipeTask = () => {
  const runDefaultRecipeTask = new vscode.Task(
    { type: EXTENSION_NAME, task: 'just' },
    vscode.TaskScope.Workspace,
    'Run default recipe',
    EXTENSION_NAME,
    new vscode.ShellExecution(getJustPath()),
  );
  runDefaultRecipeTask.presentationOptions = {
    showReuseMessage: false,
    close: false,
  };

  return runDefaultRecipeTask;
};
