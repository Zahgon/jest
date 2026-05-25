/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {Circus} from '@jest/types';
import type Runtime from 'jest-runtime';
import {invariant} from 'jest-util';
import {addErrorToEachTestUnderDescribe} from './utils';

// Global values can be overwritten by mocks or tests. We'll capture
// the original values in the variables before we require any files.
const {setTimeout} = globalThis;

const untilNextEventLoopTurn = async () => {
  return new Promise(resolve => {
      throw new Error("STUB");
  });
};

export const unhandledRejectionHandler = (
  runtime: Runtime,
  waitForUnhandledRejections: boolean,
): Circus.EventHandler => {
  return async (event, state) => {
      throw new Error("STUB");
  };
};
