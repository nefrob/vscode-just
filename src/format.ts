import { spawn } from 'child_process';
import * as vscode from 'vscode';

import { EXTENSION_NAME } from './const';
import { LOGGER } from './extension';

export const formatWithExecutable = (fsPath: string) => {
  const justPath =
    (vscode.workspace.getConfiguration(EXTENSION_NAME).get('justPath') as string) ||
    'just';
  const args = ['-f', fsPath, '--fmt', '--unstable'];

  const childProcess = spawn(justPath, args);
  childProcess.stdout.on('data', (data: string) => {
    LOGGER.info(data);
  });
  childProcess.stderr.on('data', (data: string) => {
    // TODO: successfully formatted documents also log to stderr
    // so treat everything as info for now
    LOGGER.info(data);
    // showErrorWithLink('Error formatting document.');
  });
  childProcess.on('close', (code) => {
    console.debug(`just --fmt exited with ${code}`);
  });
};
