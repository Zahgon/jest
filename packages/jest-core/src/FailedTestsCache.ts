/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {Test, TestResult} from '@jest/test-result';

type TestMap = Record<string, Record<string, boolean>>;

export default class FailedTestsCache {
  private _enabledTestsMap?: TestMap;

  filterTests(tests: Array<Test>): Array<Test> {
    const enabledTestsMap = this._enabledTestsMap;

    if (!enabledTestsMap) {
      return tests;
    }
    return tests.filter(test => { throw new Error("STUB"); });
  }

  setTestResults(testResults: Array<TestResult>): void {
    this._enabledTestsMap = (testResults || []).reduce<TestMap>(
      (suiteMap, testResult) => {
            throw new Error("STUB");
        },
      {},
    );

    this._enabledTestsMap = Object.freeze(this._enabledTestsMap);
  }
}
