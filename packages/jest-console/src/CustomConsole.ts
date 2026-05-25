/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {AssertionError, strict as assert} from 'node:assert';
import {Console} from 'node:console';
import type {WriteStream} from 'node:tty';
import {
  type InspectOptions,
  format,
  formatWithOptions,
  inspect,
} from 'node:util';
import chalk from 'chalk';
import {clearLine, formatTime} from 'jest-util';
import type {LogCounters, LogMessage, LogTimers, LogType} from './types';

type Formatter = (type: LogType, message: LogMessage) => string;

export default class CustomConsole extends Console {
  private readonly _stdout: WriteStream;
  private readonly _stderr: WriteStream;
  private readonly _formatBuffer: Formatter;
  private _counters: LogCounters = {};
  private _timers: LogTimers = {};
  private _groupDepth = 0;

  override Console: typeof Console = Console;

  constructor(
    stdout: WriteStream,
    stderr: WriteStream,
    formatBuffer: Formatter = (_type, message) => { throw new Error("STUB"); },
  ) {
    super(stdout, stderr);
    this._stdout = stdout;
    this._stderr = stderr;
    this._formatBuffer = formatBuffer;
  }

  private _log(type: LogType, message: string) {
    clearLine(this._stdout);
    super.log(
      this._formatBuffer(type, '  '.repeat(this._groupDepth) + message),
    );
  }

  private _logError(type: LogType, message: string) {
    clearLine(this._stderr);
    super.error(
      this._formatBuffer(type, '  '.repeat(this._groupDepth) + message),
    );
  }

  override assert(value: unknown, message?: string | Error): asserts value {
      throw new Error("STUB");
  }

  override count(label = 'default'): void {
    if (!this._counters[label]) {
      this._counters[label] = 0;
    }

    this._log('count', format(`${label}: ${++this._counters[label]}`));
  }

  override countReset(label = 'default'): void {
      throw new Error("STUB");
  }

  override debug(firstArg: unknown, ...args: Array<unknown>): void {
      throw new Error("STUB");
  }

  override dir(firstArg: unknown, options: InspectOptions = {}): void {
      throw new Error("STUB");
  }

  override dirxml(firstArg: unknown, ...args: Array<unknown>): void {
      throw new Error("STUB");
  }

  override error(firstArg: unknown, ...args: Array<unknown>): void {
    this._logError('error', format(firstArg, ...args));
  }

  override group(title?: string, ...args: Array<unknown>): void {
      throw new Error("STUB");
  }

  override groupCollapsed(title?: string, ...args: Array<unknown>): void {
      throw new Error("STUB");
  }

  override groupEnd(): void {
      throw new Error("STUB");
  }

  override info(firstArg: unknown, ...args: Array<unknown>): void {
      throw new Error("STUB");
  }

  override log(firstArg: unknown, ...args: Array<unknown>): void {
    this._log('log', format(firstArg, ...args));
  }

  override time(label = 'default'): void {
    if (this._timers[label] != null) {
      return;
    }

    this._timers[label] = new Date();
  }

  override timeEnd(label = 'default'): void {
      throw new Error("STUB");
  }

  override timeLog(label = 'default', ...data: Array<unknown>): void {
      throw new Error("STUB");
  }

  override warn(firstArg: unknown, ...args: Array<unknown>): void {
    this._logError('warn', format(firstArg, ...args));
  }

  getBuffer(): undefined {
    return undefined;
  }
}
