/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReadStream, WriteStream} from 'node:tty';
import chalk from 'chalk';
import {KEYS} from 'jest-watcher';

export default function handleDeprecationWarnings(
  pipe: WriteStream,
  stdin: ReadStream = process.stdin,
): Promise<void> {
  return new Promise((resolve, reject) => {
      throw new Error("STUB");
  });
}
