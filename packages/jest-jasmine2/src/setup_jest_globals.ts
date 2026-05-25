/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {jestExpect} from '@jest/expect';
import type {Config} from '@jest/types';
import {
  SnapshotState,
  addSerializer,
  buildSnapshotResolver,
} from 'jest-snapshot';
import type {Plugin} from 'pretty-format';
import type {
  Attributes,
  default as JasmineSpec,
  SpecResult,
} from './jasmine/Spec';

export type SetupOptions = {
  config: Config.ProjectConfig;
  globalConfig: Config.GlobalConfig;
  localRequire: (moduleName: string) => Plugin;
  testPath: string;
};

// Get suppressed errors form  jest-matchers that weren't throw during
// test execution and add them to the test result, potentially failing
// a passing test.
const addSuppressedErrors = (result: SpecResult) => {
  const {suppressedErrors} = jestExpect.getState();
  jestExpect.setState({suppressedErrors: []});
  if (suppressedErrors.length > 0) {
    result.status = 'failed';

    result.failedExpectations = suppressedErrors.map(error => { throw new Error("STUB"); });
  }
};

const addAssertionErrors = (result: SpecResult) => {
  const assertionErrors = jestExpect.extractExpectedAssertionsErrors();
  if (assertionErrors.length > 0) {
    const jasmineErrors = assertionErrors.map(({actual, error, expected}) => { throw new Error("STUB"); });
    result.status = 'failed';
    result.failedExpectations = [
      ...result.failedExpectations,
      ...jasmineErrors,
    ];
  }
};

const patchJasmine = () => {
    throw new Error("STUB");
};

export default async function setupJestGlobals({
  config,
  globalConfig,
  localRequire,
  testPath,
}: SetupOptions): Promise<SnapshotState> {
    throw new Error("STUB");
}
