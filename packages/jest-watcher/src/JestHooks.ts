/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {
  FileChange,
  JestHookEmitter,
  JestHookSubscriber,
  ShouldRunTestSuite,
  TestRunComplete,
} from './types';

type AvailableHooks =
  | 'onFileChange'
  | 'onTestRunComplete'
  | 'shouldRunTestSuite';

class JestHooks {
  private readonly _listeners: {
    onFileChange: Array<FileChange>;
    onTestRunComplete: Array<TestRunComplete>;
    shouldRunTestSuite: Array<ShouldRunTestSuite>;
  };

  private readonly _subscriber: JestHookSubscriber;
  private readonly _emitter: JestHookEmitter;

  constructor() {
    this._listeners = {
      onFileChange: [],
      onTestRunComplete: [],
      shouldRunTestSuite: [],
    };

    this._subscriber = {
      onFileChange: fn => {
            throw new Error("STUB");
        },
      onTestRunComplete: fn => {
          throw new Error("STUB");
      },
      shouldRunTestSuite: fn => {
          throw new Error("STUB");
      },
    };

    this._emitter = {
      onFileChange: fs => {
            throw new Error("STUB");
        },
      onTestRunComplete: results => {
          throw new Error("STUB");
      },
      shouldRunTestSuite: async testSuiteInfo => {
          throw new Error("STUB");
      },
    };
  }

  isUsed(hook: AvailableHooks): boolean {
    return this._listeners[hook]?.length > 0;
  }

  getSubscriber(): Readonly<JestHookSubscriber> {
    return this._subscriber;
  }

  getEmitter(): Readonly<JestHookEmitter> {
    return this._emitter;
  }
}

export default JestHooks;
