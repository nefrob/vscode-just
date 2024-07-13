import * as vscode from 'vscode';
// import { spawn } from 'child_process';

// const formatWithExecutable = (filePath: string) => {
//   const justPath =
//     vscode.workspace.getConfiguration('vscode-just').get('justPath') || 'just';
//   const args = ['-f', filePath, '--fmt', '--unstable'];

//   const childProcess = spawn(justPath, args);
//   childProcess.stdout.on('data', (data) => {
//     vscode.window.showInformationMessage('Formatting complete.');
//     console.log(`stdout: ${data}`);
//   });
//   childProcess.stderr.on('data', (data) => {
//     vscode.window.showErrorMessage('Error formatting document.');
//     console.error(`stderr: ${data}`);
//   });
//   childProcess.on('close', (code) => {
//     console.log(`Child process exited with code ${code}`);
//   });
// };
// // https://github.com/microsoft/vscode-extension-samples/tree/main/.base-sample
// vscode.commands.registerCommand('extension.formatDocument', () => {
//   const editor = vscode.window.activeTextEditor;
//   if (editor) {
//     const document = editor.document;
//     const filePath = document.uri.fsPath;
//     formatWithExecutable(filePath);
//   }
// });

// vscode.workspace.onWillSaveTextDocument((event) => {
//   if (vscode.workspace.getConfiguration('vscode-just').get('formatOnSave')) {
//     formatWithExecutable(event.document.uri.fsPath);
//   }
// });

// export function activate(context: vscode.ExtensionContext) {
//   console.log('Congratulations, your extension "helloworld-sample" is now active!');

//   // The command has been defined in the package.json file
//   // Now provide the implementation of the command with registerCommand
//   // The commandId parameter must match the command field in package.json
//   const disposable = vscode.commands.registerCommand('extension.helloWorld', () => {
//     // The code you place here will be executed every time your command is executed

//     // Display a message box to the user
//     vscode.window.showInformationMessage('Hello World!');
//   });

//   context.subscriptions.push(disposable);
// }

export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "helloworld-sample" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand('extension.helloWorld', () => {
    // The code you place here will be executed every time your command is executed

    // Display a message box to the user
    vscode.window.showInformationMessage('Hello World!');
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
