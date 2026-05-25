/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {FailedAssertion} from '@jest/test-result';
import {format as prettyFormat} from 'pretty-format';

function messageFormatter({error, message, passed}: Options) {
    throw new Error("STUB");
}

function stackFormatter(
  options: Options,
  initError: Error | undefined,
  errorMessage: string,
) {
    throw new Error("STUB");
}

export type Options = {
  matcherName: string;
  passed: boolean;
  actual?: any;
  error?: any;
  expected?: any;
  message?: string | null;
};

export default function expectationResultFactory(
  options: Options,
  initError?: Error,
): FailedAssertion {
    throw new Error("STUB");
}
