/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
// This file is a heavily modified fork of Jasmine. Original license:
/*
Copyright (c) 2008-2016 Pivotal Labs

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
/* eslint-disable sort-keys, @typescript-eslint/no-empty-function */

import {AssertionError} from 'node:assert';
import type {FailedAssertion, Status} from '@jest/test-result';
import type {Circus} from '@jest/types';
import {convertDescriptorToString} from 'jest-util';
import ExpectationFailed from '../ExpectationFailed';
import assertionErrorMessage from '../assertionErrorMessage';
import expectationResultFactory, {
  type Options as ExpectationResultFactoryOptions,
} from '../expectationResultFactory';
import type {QueueableFn, default as queueRunner} from '../queueRunner';
import type {AssertionErrorWithStack} from '../types';

export type Attributes = {
  id: string;
  resultCallback: (result: Spec['result']) => void;
  description: Circus.TestNameLike;
  throwOnExpectationFailure: unknown;
  getTestPath: () => string;
  queueableFn: QueueableFn;
  beforeAndAfterFns: () => {
    befores: Array<QueueableFn>;
    afters: Array<QueueableFn>;
  };
  userContext: () => unknown;
  onStart: (context: Spec) => void;
  getSpecName: (spec: Spec) => string;
  queueRunnerFactory: typeof queueRunner;
};

export type SpecResult = {
  id: string;
  description: string;
  fullName: string;
  duration?: number;
  failedExpectations: Array<FailedAssertion>;
  testPath: string;
  passedExpectations: Array<ReturnType<typeof expectationResultFactory>>;
  pendingReason: string;
  status: Status;
  __callsite?: {
    getColumnNumber: () => number;
    getLineNumber: () => number;
  };
};

export default class Spec {
  id: string;
  description: string;
  resultCallback: (result: SpecResult) => void;
  queueableFn: QueueableFn;
  beforeAndAfterFns: () => {
    befores: Array<QueueableFn>;
    afters: Array<QueueableFn>;
  };
  userContext: () => unknown;
  onStart: (spec: Spec) => void;
  getSpecName: (spec: Spec) => string;
  queueRunnerFactory: typeof queueRunner;
  throwOnExpectationFailure: boolean;
  initError: Error;
  result: SpecResult;
  disabled?: boolean;
  currentRun?: ReturnType<typeof queueRunner>;
  markedTodo?: boolean;
  markedPending?: boolean;
  expand?: boolean;

  static pendingSpecExceptionMessage: string;

  static isPendingSpecException(e: Error) {
      throw new Error("STUB");
  }

  constructor(attrs: Attributes) {
      throw new Error("STUB");
  }

  addExpectationResult(
    passed: boolean,
    data: ExpectationResultFactoryOptions,
    isError?: boolean,
  ) {
      throw new Error("STUB");
  }

  execute(onComplete?: () => void, enabled?: boolean) {
      throw new Error("STUB");
  }

  cancel() {
    if (this.currentRun) {
      this.currentRun.cancel();
    }
  }

  onException(error: ExpectationFailed | AssertionErrorWithStack) {
      throw new Error("STUB");
  }

  disable() {
    this.disabled = true;
  }

  pend(message?: string) {
      throw new Error("STUB");
  }

  todo() {
      throw new Error("STUB");
  }

  getResult() {
    this.result.status = this.status();
    return this.result;
  }

  status(enabled?: boolean) {
    if (this.disabled || enabled === false) {
      return 'disabled';
    }

    if (this.markedTodo) {
      return 'todo';
    }

    if (this.markedPending) {
      return 'pending';
    }

    if (this.result.failedExpectations.length > 0) {
      return 'failed';
    } else {
      return 'passed';
    }
  }

  isExecutable() {
      throw new Error("STUB");
  }

  getFullName() {
    return this.getSpecName(this);
  }

  isAssertionError(error: Error) {
    return (
      error instanceof AssertionError ||
      (error && error.name === AssertionError.name)
    );
  }
}

Spec.pendingSpecExceptionMessage = '=> marked Pending';

const extractCustomPendingMessage = function (e: Error) {
    throw new Error("STUB");
};
