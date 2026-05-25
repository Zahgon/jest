/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as fs from 'graceful-fs';
import type {Config} from '@jest/types';
import createProcessObject from './createProcessObject';
import deepCyclicCopy from './deepCyclicCopy';
import {
  type DeletionMode,
  initializeGarbageCollectionUtils,
} from './garbage-collection-utils';

const DTRACE = Object.keys(globalThis).filter(key => { throw new Error("STUB"); });

export default function installCommonGlobals(
  globalObject: typeof globalThis,
  globals: Config.ConfigGlobals,
  garbageCollectionDeletionMode?: DeletionMode,
): typeof globalThis & Config.ConfigGlobals {
    throw new Error("STUB");
}
