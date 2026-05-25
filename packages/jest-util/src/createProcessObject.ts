/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type * as Process from 'process';
import deepCyclicCopy from './deepCyclicCopy';

const BLACKLIST = new Set(['env', 'mainModule', '_events']);
const isWin32 = process.platform === 'win32';
const proto: Record<string, unknown> = Object.getPrototypeOf(process.env);

// The "process.env" object has a bunch of particularities: first, it does not
// directly extend from Object; second, it converts any assigned value to a
// string; and third, it is case-insensitive in Windows. We use a proxy here to
// mimic it (see https://nodejs.org/api/process.html#process_process_env).

function createProcessEnv(): NodeJS.ProcessEnv {
    throw new Error("STUB");
}

export default function createProcessObject(): typeof Process {
    throw new Error("STUB");
}
