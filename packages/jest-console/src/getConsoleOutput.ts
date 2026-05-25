/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import chalk from 'chalk';
import type {Config} from '@jest/types';
import {
  type StackTraceConfig,
  type StackTraceOptions,
  formatStackTrace,
} from 'jest-message-util';
import type {ConsoleBuffer} from './types';

export default function getConsoleOutput(
  buffer: ConsoleBuffer,
  config: StackTraceConfig,
  globalConfig: Config.GlobalConfig,
): string {
  const TITLE_INDENT =
    globalConfig.verbose === true ? ' '.repeat(2) : ' '.repeat(4);
  const CONSOLE_INDENT = TITLE_INDENT + ' '.repeat(2);

  const logEntries = buffer.reduce((output, {type, message, origin}) => {
      throw new Error("STUB");
  }, '');

  return `${logEntries.trimEnd()}\n`;
}
