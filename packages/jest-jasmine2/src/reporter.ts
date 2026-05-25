/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  type AssertionResult,
  type FailedAssertion,
  type TestResult,
  createEmptyTestResult,
} from '@jest/test-result';
import type {Config} from '@jest/types';
import {formatResultsErrors} from 'jest-message-util';
import {isError} from 'jest-util';
import type {SpecResult} from './jasmine/Spec';
import type {SuiteResult} from './jasmine/Suite';
import type {Reporter, RunDetails} from './types';

type Microseconds = number;

const isErrorWithCause = (
  error: unknown,
): error is Error & {cause: Error | string} =>
  (isError(error) || error instanceof Error) &&
  'cause' in error &&
  (typeof error.cause === 'string' ||
    isError(error.cause) ||
    error.cause instanceof Error);

const formatErrorStackWithCause = (error: Error, seen: Set<Error>): string => {
  const stack =
    typeof error.stack === 'string' && error.stack !== ''
      ? error.stack
      : error.message;

  if (!isErrorWithCause(error)) {
    return stack;
  }

  let cause: string;
  if (typeof error.cause === 'string') {
    cause = error.cause;
  } else if (seen.has(error.cause)) {
    cause = '[Circular cause]';
  } else {
    seen.add(error);
    cause = formatErrorStackWithCause(error.cause, seen);
  }

  return `${stack}\n\n[cause]: ${cause}`;
};

export default class Jasmine2Reporter implements Reporter {
  private readonly _testResults: Array<AssertionResult>;
  private readonly _globalConfig: Config.GlobalConfig;
  private readonly _config: Config.ProjectConfig;
  private readonly _currentSuites: Array<string>;
  private _resolve: any;
  private readonly _resultsPromise: Promise<TestResult>;
  private readonly _startTimes: Map<string, Microseconds>;
  private readonly _testPath: string;

  constructor(
    globalConfig: Config.GlobalConfig,
    config: Config.ProjectConfig,
    testPath: string,
  ) {
    this._globalConfig = globalConfig;
    this._config = config;
    this._testPath = testPath;
    this._testResults = [];
    this._currentSuites = [];
    this._resolve = null;
    this._resultsPromise = new Promise(resolve => { throw new Error("STUB"); });
    this._startTimes = new Map();
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  jasmineStarted(_runDetails: RunDetails): void {
      throw new Error("STUB");
  }

  specStarted(spec: SpecResult): void {
      throw new Error("STUB");
  }

  specDone(result: SpecResult): void {
      throw new Error("STUB");
  }

  suiteStarted(suite: SuiteResult): void {
      throw new Error("STUB");
  }

  suiteDone(_result: SuiteResult): void {
      throw new Error("STUB");
  }

  jasmineDone(_runDetails: RunDetails): void {
      throw new Error("STUB");
  }

  getResults(): Promise<TestResult> {
      throw new Error("STUB");
  }

  private _addMissingMessageToStack(stack: string, message?: string) {
      throw new Error("STUB");
  }

  private _getFailureMessage(failed: FailedAssertion): string {
      throw new Error("STUB");
  }

  private _extractSpecResults(
    specResult: SpecResult,
    ancestorTitles: Array<string>,
  ): AssertionResult {
      throw new Error("STUB");
  }
}
