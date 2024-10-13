import { spawn } from 'child_process';

import { getLogger } from './logger';
import { getJustPath } from './utils';

const LOGGER = getLogger();

export const formatWithExecutable = (fsPath: string) => {
  const args = ['-f', fsPath, '--fmt', '--unstable'];

  const childProcess = spawn(getJustPath(), args);
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
