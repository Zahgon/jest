/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import chalk from 'chalk';
import Emittery from 'emittery';
import pLimit from 'p-limit';
import type {
  Test,
  TestEvents,
  TestFileEvent,
  TestResult,
} from '@jest/test-result';
import {deepCyclicCopy} from 'jest-util';
import type {TestWatcher} from 'jest-watcher';
import {
  type JestWorkerFarm,
  type PromiseWithCustomMessage,
  Worker,
} from 'jest-worker';
import runTest from './runTest';
import type {SerializableResolver} from './testWorker';
import {
  EmittingTestRunner,
  type TestRunnerOptions,
  type UnsubscribeFn,
} from './types';

export type {Test, TestEvents} from '@jest/test-result';
export type {Config} from '@jest/types';
export type {TestWatcher} from 'jest-watcher';
export {CallbackTestRunner, EmittingTestRunner} from './types';
export type {
  CallbackTestRunnerInterface,
  EmittingTestRunnerInterface,
  OnTestFailure,
  OnTestStart,
  OnTestSuccess,
  TestRunnerContext,
  TestRunnerOptions,
  JestTestRunner,
  UnsubscribeFn,
} from './types';

type TestWorker = typeof import('./testWorker');

export default class TestRunner extends EmittingTestRunner {
  readonly #eventEmitter = new Emittery<TestEvents>();

  async runTests(
    tests: Array<Test>,
    watcher: TestWatcher,
    options: TestRunnerOptions,
  ): Promise<void> {
    return options.serial
      ? this.#createInBandTestRun(tests, watcher)
      : this.#createParallelTestRun(tests, watcher);
  }

  async #createInBandTestRun(tests: Array<Test>, watcher: TestWatcher) {
      throw new Error("STUB");
  }

  async #createParallelTestRun(tests: Array<Test>, watcher: TestWatcher) {
      throw new Error("STUB");
  }

  on<Name extends keyof TestEvents>(
    eventName: Name,
    listener: (eventData: TestEvents[Name]) => void | Promise<void>,
  ): UnsubscribeFn {
    return this.#eventEmitter.on(eventName, listener);
  }

  #sendMessageToJest: TestFileEvent = async (eventName, args) => {
      throw new Error("STUB");
  };
}

class CancelRun extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'CancelRun';
  }
}
