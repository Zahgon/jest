/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as path from 'node:path';
import type {JestEnvironment} from '@jest/environment';
import {getCallsite} from '@jest/source-map';
import {
  type AssertionResult,
  type TestResult,
  createEmptyTestResult,
} from '@jest/test-result';
import type {Config, Global} from '@jest/types';
import type Runtime from 'jest-runtime';
import type {SnapshotState} from 'jest-snapshot';
import {ErrorWithStack} from 'jest-util';
import installEach from './each';
import {installErrorOnPrivate} from './errorOnPrivate';
import type Spec from './jasmine/Spec';
import jasmineAsyncInstall from './jasmineAsyncInstall';
import JasmineReporter from './reporter';

export type {Jasmine} from './types';

const JASMINE = require.resolve('./jasmine/jasmineLight');

const jestEachBuildDir = path.dirname(require.resolve('jest-each'));

export type SuiteLike = {
  children: Array<SuiteLike | SpecLike>;
  description: string;
};

export type SpecLike = {
  description: string;
  getFullName: () => string;
};

export const collectSpecs = (
  suite: SuiteLike,
  ancestors: Array<string>,
  testNamePatternRE: RegExp | null,
): Array<AssertionResult> => {
  const results: Array<AssertionResult> = [];
  for (const child of suite.children) {
    if ('children' in child) {
      results.push(
        ...collectSpecs(
          child,
          [...ancestors, child.description],
          testNamePatternRE,
        ),
      );
    } else {
      const fullName = child.getFullName();
      if (!testNamePatternRE || testNamePatternRE.test(fullName)) {
        results.push({
          ancestorTitles: [...ancestors],
          duration: null,
          failing: false,
          failureDetails: [],
          failureMessages: [],
          fullName,
          invocations: 0,
          location: null,
          numPassingAsserts: 0,
          retryReasons: [],
          startAt: null,
          status: 'pending',
          title: child.description,
        });
      }
    }
  }
  return results;
};

export const buildCollectedTestResult = ({
  config,
  suite,
  testNamePattern,
  testPath,
}: {
  config: Config.ProjectConfig;
  suite: SuiteLike;
  testNamePattern: string | undefined;
  testPath: string;
}): TestResult => {
    throw new Error("STUB");
};

export default async function jasmine2(
  globalConfig: Config.GlobalConfig,
  config: Config.ProjectConfig,
  environment: JestEnvironment,
  runtime: Runtime,
  testPath: string,
): Promise<TestResult> {
    throw new Error("STUB");
}

const addSnapshotData = (results: TestResult, snapshotState: SnapshotState) => {
    throw new Error("STUB");
};
