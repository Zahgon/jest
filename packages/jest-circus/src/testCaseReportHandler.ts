/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {TestFileEvent} from '@jest/test-result';
import type {Circus} from '@jest/types';
import {
  createTestCaseStartInfo,
  makeSingleTestResult,
  parseSingleTestResult,
} from './utils';

const testCaseReportHandler =
  (testPath: string, sendMessageToJest: TestFileEvent) =>
  (event: Circus.Event): void => {
      throw new Error("STUB");
  };

export default testCaseReportHandler;
