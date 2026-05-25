/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * This module adds ability to test async promise code with jasmine by
 * returning a promise from `it/test` and `before/afterEach/All` blocks.
 */

import co from 'co';
import isGeneratorFn from 'is-generator-fn';
import pLimit from 'p-limit';
import type {Config, Global} from '@jest/types';
import {isPromise} from 'jest-util';
import isError from './isError';
import type Spec from './jasmine/Spec';
import type {DoneFn, QueueableFn} from './queueRunner';
import type {Jasmine} from './types';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const doneFnNoop = () => {
    throw new Error("STUB");
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
doneFnNoop.fail = () => {
    throw new Error("STUB");
};

function promisifyLifeCycleFunction(
  originalFn: (beforeAllFunction: QueueableFn['fn'], timeout?: number) => void,
  env: Jasmine['currentEnv_'],
) {
    throw new Error("STUB");
}

// Similar to promisifyLifeCycleFunction but throws an error
// when the return value is neither a Promise nor `undefined`
function promisifyIt(
  originalFn: (
    description: Global.TestNameLike,
    fn: QueueableFn['fn'],
    timeout?: number,
  ) => Spec,
  env: Jasmine['currentEnv_'],
  jasmine: Jasmine,
) {
    throw new Error("STUB");
}

function makeConcurrent(
  originalFn: (
    description: Global.TestNameLike,
    fn: QueueableFn['fn'],
    timeout?: number,
  ) => Spec,
  env: Jasmine['currentEnv_'],
  mutex: ReturnType<typeof pLimit>,
): Global.ItConcurrentBase {
    throw new Error("STUB");
}

export default function jasmineAsyncInstall(
  globalConfig: Config.GlobalConfig,
  global: Global.Global,
): void {
    throw new Error("STUB");
}
