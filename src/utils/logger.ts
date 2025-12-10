/**
 * Simple Logger Utility with Colors
 */
export class Logger {
  // ANSI color codes
  private static readonly colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    gray: '\x1b[90m'
  };

  private static getTimestamp(): string {
    return new Date().toISOString();
  }

  private static formatMessage(level: string, message: string, color: string): string {
    const timestamp = `${this.colors.gray}[${this.getTimestamp()}]${this.colors.reset}`;
    const levelFormatted = `${color}[${level}]${this.colors.reset}`;
    return `${timestamp} ${levelFormatted} ${message}`;
  }

  public static log(message: string): void {
    console.log(this.formatMessage("INFO", message, this.colors.green));
  }

  public static error(message: string): void {
    console.error(this.formatMessage("ERROR", message, this.colors.red));
  }

  public static warn(message: string): void {
    console.warn(this.formatMessage("WARN", message, this.colors.yellow));
  }

  public static debug(message: string): void {
    console.debug(this.formatMessage("DEBUG", message, this.colors.cyan));
  }
}
