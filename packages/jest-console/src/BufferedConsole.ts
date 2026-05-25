/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {AssertionError, strict as assert} from 'node:assert';
import {Console} from 'node:console';
import {
  type InspectOptions,
  format,
  formatWithOptions,
  inspect,
} from 'node:util';
import chalk from 'chalk';
import {ErrorWithStack, formatTime, invariant} from 'jest-util';
import type {
  ConsoleBuffer,
  LogCounters,
  LogMessage,
  LogTimers,
  LogType,
} from './types';

export default class BufferedConsole extends Console {
  private readonly _buffer: ConsoleBuffer = [];
  private _counters: LogCounters = {};
  private _timers: LogTimers = {};
  private _groupDepth = 0;

  override Console: typeof Console = Console;

  constructor() {
    super({
      write: (message: string) => {
            throw new Error("STUB");
        },
    } as NodeJS.WritableStream);
  }

  static write(
    this: void,
    buffer: ConsoleBuffer,
    type: LogType,
    message: LogMessage,
    stackLevel = 2,
  ): ConsoleBuffer {
    const rawStack = new ErrorWithStack(undefined, BufferedConsole.write).stack;

    invariant(rawStack != null, 'always have a stack trace');

    const origin = rawStack
      .split('\n')
      .slice(stackLevel)
      .filter(Boolean)
      .join('\n');

    buffer.push({
      message,
      origin,
      type,
    });

    return buffer;
  }

  private _log(type: LogType, message: LogMessage) {
    BufferedConsole.write(
      this._buffer,
      type,
      '  '.repeat(this._groupDepth) + message,
      3,
    );
  }

  override assert(value: unknown, message?: string | Error): void {
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

  override debug(firstArg: unknown, ...rest: Array<unknown>): void {
      throw new Error("STUB");
  }

  override dir(firstArg: unknown, options: InspectOptions = {}): void {
      throw new Error("STUB");
  }

  override dirxml(firstArg: unknown, ...rest: Array<unknown>): void {
      throw new Error("STUB");
  }

  override error(firstArg: unknown, ...rest: Array<unknown>): void {
    this._log('error', format(firstArg, ...rest));
  }

  override group(title?: string, ...rest: Array<unknown>): void {
      throw new Error("STUB");
  }

  override groupCollapsed(title?: string, ...rest: Array<unknown>): void {
      throw new Error("STUB");
  }

  override groupEnd(): void {
      throw new Error("STUB");
  }

  override info(firstArg: unknown, ...rest: Array<unknown>): void {
      throw new Error("STUB");
  }

  override log(firstArg: unknown, ...rest: Array<unknown>): void {
    this._log('log', format(firstArg, ...rest));
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

  override warn(firstArg: unknown, ...rest: Array<unknown>): void {
    this._log('warn', format(firstArg, ...rest));
  }

  getBuffer(): ConsoleBuffer | undefined {
    return this._buffer.length > 0 ? this._buffer : undefined;
  }
}
