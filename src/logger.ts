import * as vscode from 'vscode';

enum LogLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
}

export default class Logger {
  private outputChannel: vscode.OutputChannel;

  constructor(channelName: string) {
    this.outputChannel = vscode.window.createOutputChannel(channelName);
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
    const timestamp = new Date().toString();
    this.outputChannel.appendLine(`[${timestamp}] [${level}] ${message}`);
  }
}
