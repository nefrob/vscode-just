import * as vscode from 'vscode';

import { EXTENSION_NAME, SETTINGS } from './const';

enum LogLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
}

let LOGGER: Logger;

class Logger implements vscode.Disposable {
  private outputChannel: vscode.OutputChannel;
  private level: LogLevel;

  constructor(channelName: string, level: LogLevel = LogLevel.INFO) {
    this.outputChannel = vscode.window.createOutputChannel(channelName);
    this.level = level;
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
  }

  private log(message: string, level: LogLevel = LogLevel.INFO) {
    if (!this.shouldLog(level)) return;

    const timestamp = new Date().toISOString();
    this.outputChannel.append(`[${timestamp}] [${level}] ${message}`);
  }

  private shouldLog(level: LogLevel): boolean {
    return getLogLevelValue(level) >= getLogLevelValue(this.level);
  }
}

export const getLogger = (): Logger => {
  if (!LOGGER) {
    LOGGER = new Logger(
      EXTENSION_NAME,
      vscode.workspace.getConfiguration(EXTENSION_NAME).get(SETTINGS.logLevel) ??
        LogLevel.INFO,
    );
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
    default:
      return 0;
  }
};
