import { spawn } from 'child_process';
import * as vscode from 'vscode';
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
} from 'vscode-languageclient/node';

import { EXTENSION_NAME, SETTINGS } from './const';
import { getLogger } from './logger';

const LOGGER = getLogger();

let client: LanguageClient | undefined;

export const createLanguageClient = async (): Promise<LanguageClient | null> => {
  const lspPath = getLspPath();

  const isAvailable = await checkLspAvailability(lspPath);
  if (!isAvailable) {
    vscode.window
      .showWarningMessage(
        `Just LSP binary found but not working: ${lspPath}. Please check the installation or configure the path in settings.`,
        'Install Instructions',
      )
      .then((selection) => {
        if (selection === 'Install Instructions') {
          vscode.env.openExternal(
            vscode.Uri.parse('https://github.com/terror/just-lsp#installation'),
          );
        }
      });

    return null;
  }

  const serverOptions: ServerOptions = {
    command: lspPath,
    args: [],
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: 'file', language: 'just' }],
    synchronize: {
      fileEvents: vscode.workspace.createFileSystemWatcher(
        '**/{justfile,Justfile,.justfile,*.just}',
      ),
    },
  };

  client = new LanguageClient(
    'just-lsp',
    'Just Language Server',
    serverOptions,
    clientOptions,
  );

  try {
    await client.start();
    LOGGER.info(`Just LSP started successfully using: ${lspPath}`);
    return client;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    LOGGER.error(`Failed to start Just LSP: ${message}`);
    vscode.window.showErrorMessage(`Failed to start Just Language Server: ${message}`);
    return null;
  }
};

export const stopLanguageClient = async (): Promise<void> => {
  if (client) {
    await client.stop();
    client = undefined;
  }
};

const checkLspAvailability = (lspPath: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const process = spawn(lspPath, ['--version'], { stdio: 'ignore' });

    process.on('close', (code: number) => {
      resolve(code === 0);
    });
    process.on('error', () => {
      resolve(false);
    });

    setTimeout(() => {
      process.kill();
      resolve(false);
    }, 5000);
  });
};

const getLspPath = (): string => {
  // TODO: support bundled LSP binary
  return (
    (vscode.workspace
      .getConfiguration(EXTENSION_NAME)
      .get(SETTINGS.lspPath) as string) || 'just-lsp'
  );
};
