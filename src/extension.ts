import { spawn } from 'child_process';
import * as vscode from 'vscode';

const formatWithExecutable = (fsPath: string) => {
  const justPath =
    (vscode.workspace.getConfiguration('vscode-just').get('justPath') as string) ||
    'just';
  const args = ['-f', fsPath, '--fmt', '--unstable'];

  const childProcess = spawn(justPath, args);
  childProcess.stdout.on('data', (data) => {
    vscode.window.showInformationMessage('Formatting complete.');
    console.log(`stdout: ${data}`);
  });
  childProcess.stderr.on('data', (data) => {
    vscode.window.showErrorMessage('Error formatting document.');
    console.error(`stderr: ${data}`);
  });
  childProcess.on('close', (code) => {
    console.log(`Just format exited with ${code}`);
  });
};

vscode.workspace.onWillSaveTextDocument((event) => {
  if (vscode.workspace.getConfiguration('vscode-just').get('formatOnSave')) {
    formatWithExecutable(event.document.uri.fsPath);
  }
});

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('extension.formatOnSave', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      formatWithExecutable(editor.document.uri.fsPath);
    }
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
