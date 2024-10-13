import * as vscode from 'vscode';

import { EXTENSION_NAME, SETTINGS } from './const';

enum LogLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  NONE = 'none',
}

let LOGGER: Logger;

class Logger implements vscode.Disposable {
  private outputChannel: vscode.OutputChannel;
  private level: LogLevel;
  private onDidChangeConfigurationDisposable: vscode.Disposable;

  constructor(channelName: string) {
    this.outputChannel = vscode.window.createOutputChannel(channelName);
    this.level =
      vscode.workspace.getConfiguration(EXTENSION_NAME).get(SETTINGS.logLevel) ??
      LogLevel.INFO;
    this.onDidChangeConfigurationDisposable = vscode.workspace.onDidChangeConfiguration(
      (e) => {
        if (e.affectsConfiguration(`${EXTENSION_NAME}.${SETTINGS.logLevel}`)) {
          this.level =
            vscode.workspace.getConfiguration(EXTENSION_NAME).get(SETTINGS.logLevel) ??
            this.level;
        }
      },
    );
  }

  public info(message: string) {
    this.log(message);
  }

  public warning(message: string) {
    this.log(message, LogLevel.WARNING);
  }

  public error(message: string) {
    this.log(message, LogLevel.ERROR);
  }

  public show() {
    this.outputChannel.show();
  }

  public dispose() {
    this.outputChannel.dispose();
    this.onDidChangeConfigurationDisposable.dispose();
  }

  private log(message: string, level: LogLevel = LogLevel.INFO) {
    if (!this.shouldLog(level)) return;

    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}`;
    if (message.endsWith('\n')) {
      this.outputChannel.append(logMessage);
    } else {
      this.outputChannel.appendLine(logMessage);
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return getLogLevelValue(level) >= getLogLevelValue(this.level);
  }
}

export const getLogger = (): Logger => {
  if (!LOGGER) {
    LOGGER = new Logger(EXTENSION_NAME);
  }
  return LOGGER;
};

const getLogLevelValue = (level: string): number => {
  switch (level) {
    case LogLevel.INFO:
      return 0;
    case LogLevel.WARNING:
      return 1;
    case LogLevel.ERROR:
      return 2;
    case LogLevel.NONE:
      return 3;
    default:
      return 0;
  }
};
