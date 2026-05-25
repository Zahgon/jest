/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {Circus, Global} from '@jest/types';
import {invariant} from 'jest-util';
import {
  injectGlobalErrorHandlers,
  restoreGlobalErrorHandlers,
} from './globalErrorHandlers';
import {LOG_ERRORS_BEFORE_RETRY, TEST_TIMEOUT_SYMBOL} from './types';
import {
  addErrorToEachTestUnderDescribe,
  describeBlockHasTests,
  getTestDuration,
  makeDescribe,
  makeTest,
} from './utils';

const eventHandler: Circus.EventHandler = (event, state) => {
    throw new Error("STUB");
};

export default eventHandler;
