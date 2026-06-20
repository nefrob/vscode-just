import * as vscode from 'vscode';

import { EXTENSION_NAME, SETTINGS } from './const';
import { workspaceRoot } from './utils';

let LAUNCHER: Launcher;

class Launcher implements vscode.Disposable {
    private terminals: Set<vscode.Terminal>;

    private dedicatedTerminal: vscode.Terminal | undefined;

    private onTerminalClose = vscode.window.onDidCloseTerminal((terminal) => {
        if (this.terminals.has(terminal)) {
            this.terminals.delete(terminal);
        }
        if (this.dedicatedTerminal === terminal) {
            this.dedicatedTerminal = undefined;
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

        const reuseTerminal = vscode.workspace
            .getConfiguration(EXTENSION_NAME)
            .get(SETTINGS.useSingleTerminal);

        let terminal: vscode.Terminal;
        if (reuseTerminal && this.terminals.size > 0) {
            terminal = this.terminals.values().next().value!;
        } else {
            terminal = vscode.window.createTerminal(terminalOptions);
            this.terminals.add(terminal);
        }

        terminal.sendText(`${command} ${args.join(' ')}`);
        terminal.show();

        return terminal;
    }

    public launchDedicated(command: string, args: string[], cwd?: string) {
        if (!this.dedicatedTerminal) {
            const terminalOptions: vscode.TerminalOptions = {
                name: 'just',
                env: process.env,
                cwd: cwd ?? workspaceRoot(),
            };

            if (process.platform === 'win32') {
                terminalOptions.shellPath = 'C:\\Windows\\System32\\cmd.exe';
            }

            this.dedicatedTerminal = vscode.window.createTerminal(terminalOptions);
        }

        const cmdLine = cwd
            ? `cd "${cwd}" && ${command} ${args.join(' ')}`
            : `${command} ${args.join(' ')}`;

        this.dedicatedTerminal.sendText(cmdLine);
        this.dedicatedTerminal.show();

        return this.dedicatedTerminal;
    }

    public dispose() {
        this.terminals.forEach((terminal) => terminal.dispose());
        this.terminals.clear();
        this.dedicatedTerminal?.dispose();
        this.dedicatedTerminal = undefined;
        this.onTerminalClose.dispose();
    }
}

export const getLauncher = () => {
    if (!LAUNCHER) {
        LAUNCHER = new Launcher();
    }
    return LAUNCHER;
};
