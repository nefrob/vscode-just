import * as vscode from 'vscode';

import { workspaceRoot } from './utils';

let LAUNCHER: Launcher;

class Launcher implements vscode.Disposable {
  private terminal: vscode.Terminal | undefined;
  private onTerminalClose = vscode.window.onDidCloseTerminal((terminal) => {
    if (terminal === this.terminal) {
      this.terminal = undefined;
    }
  });

  constructor() {
    this.terminal = vscode.window.createTerminal('Recipe Launcher');
  }

  public launch(command: string, args: string[]) {
    const terminalOptions: vscode.TerminalOptions = {
      name: command,
      env: process.env,
      cwd: workspaceRoot(),
    };

    if (!this.terminal) {
      this.terminal = vscode.window.createTerminal(terminalOptions);
    }

    this.terminal.sendText(`${command} ${args.join(' ')}`);
    this.terminal.show();

    return this.terminal;
  }

  public dispose() {
    this.terminal?.dispose();
    this.onTerminalClose.dispose();
  }
}

export const getLauncher = () => {
  if (!LAUNCHER) {
    LAUNCHER = new Launcher();
  }
  return LAUNCHER;
};
