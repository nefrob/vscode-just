import * as vscode from 'vscode';

import { workspaceRoot } from './utils';

let LAUNCHER: Launcher;

class Launcher implements vscode.Disposable {
  private terminals: Set<vscode.Terminal>;

  private onTerminalClose = vscode.window.onDidCloseTerminal((terminal) => {
    if (this.terminals.has(terminal)) {
      this.terminals.delete(terminal);
    }
  });

  constructor() {
    this.terminals = new Set();
  }

  public launch(command: string, args: string[]) {
    const terminalOptions: vscode.TerminalOptions = {
      name: command,
      env: process.env,
      cwd: workspaceRoot(),
    };

    // Copied from Makefile launcher:
    // https://github.com/microsoft/vscode-makefile-tools/blob/36a51746d263b6fc4a9054924c388d2c8a49ee1b/src/launch.ts#L445
    if (process.platform === 'win32') {
      terminalOptions.shellPath = 'C:\\Windows\\System32\\cmd.exe';
    }

    const terminal = vscode.window.createTerminal(terminalOptions);
    this.terminals.add(terminal);

    terminal.sendText(`${command} ${args.join(' ')}`);
    terminal.show();

    return terminal;
  }

  public dispose() {
    this.terminals.forEach((terminal) => terminal.dispose());
    this.terminals.clear();
    this.onTerminalClose.dispose();
  }
}

export const getLauncher = () => {
  if (!LAUNCHER) {
    LAUNCHER = new Launcher();
  }
  return LAUNCHER;
};
