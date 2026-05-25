/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as path from 'node:path';
import co from 'co';
import dedent from 'dedent';
import isGeneratorFn from 'is-generator-fn';
import slash from 'slash';
import StackUtils from 'stack-utils';
import type {Status, TestCaseResult} from '@jest/test-result';
import type {Circus, Global} from '@jest/types';
import {
  ErrorWithStack,
  convertDescriptorToString,
  formatTime,
  invariant,
  isError,
  isPromise,
} from 'jest-util';
import {format as prettyFormat} from 'pretty-format';
import {ROOT_DESCRIBE_BLOCK_NAME, getState} from './state';

const stackUtils = new StackUtils({cwd: 'A path that does not exist'});

const jestEachBuildDir = slash(path.dirname(require.resolve('jest-each')));

function takesDoneCallback(fn: Circus.AsyncFn): fn is Global.DoneTakingTestFn {
  return fn.length > 0;
}

function isGeneratorFunction(
  fn: Global.PromiseReturningTestFn | Global.GeneratorReturningTestFn,
): fn is Global.GeneratorReturningTestFn {
  return isGeneratorFn(fn);
}

export const makeDescribe = (
  name: Circus.BlockName,
  parent?: Circus.DescribeBlock,
  mode?: Circus.BlockMode,
): Circus.DescribeBlock => {
  let _mode = mode;
  if (parent && !mode) {
    // If not set explicitly, inherit from the parent describe.
    _mode = parent.mode;
  }

  return {
    type: 'describeBlock', // eslint-disable-next-line sort-keys
    children: [],
    hooks: [],
    mode: _mode,
    name: convertDescriptorToString(name),
    parent,
    tests: [],
  };
};

export const makeTest = (
  fn: Circus.TestFn,
  mode: Circus.TestMode,
  concurrent: boolean,
  name: Circus.TestName,
  parent: Circus.DescribeBlock,
  timeout: number | undefined,
  asyncError: Circus.Exception,
  failing: boolean,
): Circus.TestEntry => ({
  type: 'test', // eslint-disable-next-line sort-keys
  asyncError,
  concurrent,
  duration: null,
  errors: [],
  failing,
  fn,
  invocations: 0,
  mode,
  name: convertDescriptorToString(name),
  numPassingAsserts: 0,
  parent,
  retryReasons: [],
  seenDone: false,
  startedAt: null,
  status: null,
  timeout,
  unhandledRejectionErrorByPromise: new Map(),
});

// Traverse the tree of describe blocks and return true if at least one describe
// block has an enabled test.
const hasEnabledTest = (describeBlock: Circus.DescribeBlock): boolean => {
  const {hasFocusedTests, testNamePattern} = getState();
  return describeBlock.children.some(child =>
    { throw new Error("STUB"); },
  );
};

type DescribeHooks = {
  beforeAll: Array<Circus.Hook>;
  afterAll: Array<Circus.Hook>;
};

export const getAllHooksForDescribe = (
  describe: Circus.DescribeBlock,
): DescribeHooks => {
  const result: DescribeHooks = {
    afterAll: [],
    beforeAll: [],
  };

  if (hasEnabledTest(describe)) {
    for (const hook of describe.hooks) {
      switch (hook.type) {
        case 'beforeAll':
          result.beforeAll.push(hook);
          break;
        case 'afterAll':
          result.afterAll.push(hook);
          break;
      }
    }
  }

  return result;
};

type TestHooks = {
  beforeEach: Array<Circus.Hook>;
  afterEach: Array<Circus.Hook>;
};

export const getEachHooksForTest = (test: Circus.TestEntry): TestHooks => {
  const result: TestHooks = {afterEach: [], beforeEach: []};
  if (test.concurrent) {
    // *Each hooks are not run for concurrent tests
    return result;
  }

  let block: Circus.DescribeBlock | undefined | null = test.parent;

  do {
    const beforeEachForCurrentBlock = [];
    for (const hook of block.hooks) {
      switch (hook.type) {
        case 'beforeEach':
          beforeEachForCurrentBlock.push(hook);
          break;
        case 'afterEach':
          result.afterEach.push(hook);
          break;
      }
    }
    // 'beforeEach' hooks are executed from top to bottom, the opposite of the
    // way we traversed it.
    result.beforeEach.unshift(...beforeEachForCurrentBlock);
  } while ((block = block.parent));
  return result;
};

export const describeBlockHasTests = (
  describe: Circus.DescribeBlock,
): boolean =>
  describe.children.some(
    child => { throw new Error("STUB"); },
  );

const _makeTimeoutMessage = (
  timeout: number,
  isHook: boolean,
  takesDoneCallback: boolean,
) =>
  `Exceeded timeout of ${formatTime(timeout)} for a ${
    isHook ? 'hook' : 'test'
  }${
    takesDoneCallback ? ' while waiting for `done()` to be called' : ''
  }.\nAdd a timeout value to this test to increase the timeout, if this is a long-running test. See https://jestjs.io/docs/api#testname-fn-timeout.`;

// Global values can be overwritten by mocks or tests. We'll capture
// the original values in the variables before we require any files.
const {setTimeout, clearTimeout} = globalThis;

function checkIsError(error: unknown): error is Error {
  return !!(error && (error as Error).message && (error as Error).stack);
}

export const callAsyncCircusFn = (
  testOrHook: Circus.TestEntry | Circus.Hook,
  testContext: Circus.TestContext,
  {isHook, timeout}: {isHook: boolean; timeout: number},
): Promise<unknown> => {
  let timeoutID: NodeJS.Timeout;
  let completed = false;

  const {fn, asyncError} = testOrHook;
  const doneCallback = takesDoneCallback(fn);

  return new Promise<void>((resolve, reject) => {
      throw new Error("STUB");
  }).finally(() => {
      throw new Error("STUB");
  });
};

export const getTestDuration = (test: Circus.TestEntry): number | null => {
  const {startedAt} = test;
  return typeof startedAt === 'number' ? Date.now() - startedAt : null;
};

export const makeRunResult = (
  describeBlock: Circus.DescribeBlock,
  unhandledErrors: Array<Error>,
): Circus.RunResult => ({
  testResults: makeTestResults(describeBlock),
  unhandledErrors: unhandledErrors.map(_getError).map(getErrorStack),
});

const getTestNamesPath = (test: Circus.TestEntry): Circus.TestNamesPath => {
  const titles = [];
  let parent: Circus.TestEntry | Circus.DescribeBlock | undefined = test;
  do {
    titles.unshift(parent.name);
  } while ((parent = parent.parent));

  return titles;
};

export const makeSingleTestResult = (
  test: Circus.TestEntry,
): Circus.TestResult => {
  const {includeTestLocationInResult} = getState();

  const {status} = test;
  invariant(status, 'Status should be present after tests are run.');

  const testPath = getTestNamesPath(test);

  let location = null;
  if (includeTestLocationInResult) {
    const stackLines = test.asyncError.stack.split('\n');
    const stackLine = stackLines[1];
    let parsedLine = stackUtils.parseLine(stackLine);
    if (parsedLine?.file?.startsWith(jestEachBuildDir)) {
      const stackLine = stackLines[2];
      parsedLine = stackUtils.parseLine(stackLine);
    }
    if (
      parsedLine &&
      typeof parsedLine.column === 'number' &&
      typeof parsedLine.line === 'number'
    ) {
      location = {
        column: parsedLine.column,
        line: parsedLine.line,
      };
    }
  }

  const errorsDetailed = test.errors.map(_getError);

  return {
    duration: test.duration,
    errors: errorsDetailed.map(getErrorStack),
    errorsDetailed,
    failing: test.failing,
    invocations: test.invocations,
    location,
    numPassingAsserts: test.numPassingAsserts,
    retryReasons: test.retryReasons.map(_getError).map(getErrorStack),
    startedAt: test.startedAt,
    status,
    testPath: [...testPath],
  };
};

const makeTestResults = (
  describeBlock: Circus.DescribeBlock,
): Circus.TestResults => {
  const testResults = [];
  const stack: [[Circus.DescribeBlock, number]] = [[describeBlock, 0]];

  while (stack.length > 0) {
    const [currentBlock, childIndex] = stack.pop()!;

    for (let i = childIndex; i < currentBlock.children.length; i++) {
      const child = currentBlock.children[i];

      if (child.type === 'describeBlock') {
        stack.push([currentBlock, i + 1], [child, 0]);
        break;
      }
      if (child.type === 'test') {
        testResults.push(makeSingleTestResult(child));
      }
    }
  }

  return testResults;
};

// Return a string that identifies the test (concat of parent describe block
// names + test title)
export const getTestID = (test: Circus.TestEntry): string => {
  const testNamesPath = getTestNamesPath(test);
  testNamesPath.shift(); // remove TOP_DESCRIBE_BLOCK_NAME
  return testNamesPath.join(' ');
};

const _getError = (
  errors?: Circus.Exception | [Circus.Exception | undefined, Circus.Exception],
): Error => {
    throw new Error("STUB");
};

const isErrorOrStackWithCause = (
  errorOrStack: Error | string,
): errorOrStack is Error & {cause: Error | string} =>
  typeof errorOrStack !== 'string' &&
  'cause' in errorOrStack &&
  (typeof errorOrStack.cause === 'string' ||
    isError(errorOrStack.cause) ||
    errorOrStack.cause instanceof Error);

const formatErrorStackWithCause = (error: Error, seen: Set<Error>): string => {
  const stack =
    typeof error.stack === 'string' && error.stack !== ''
      ? error.stack
      : error.message;

  if (!isErrorOrStackWithCause(error)) {
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

const getErrorStack = (error: Error): string =>
  { throw new Error("STUB"); };

export const addErrorToEachTestUnderDescribe = (
  describeBlock: Circus.DescribeBlock,
  error: Circus.Exception,
  asyncError: Circus.Exception,
): void => {
  for (const child of describeBlock.children) {
    switch (child.type) {
      case 'describeBlock':
        addErrorToEachTestUnderDescribe(child, error, asyncError);
        break;
      case 'test':
        child.errors.push([error, asyncError]);
        break;
    }
  }
};

type TestDescription = {
  ancestorTitles: Array<string>;
  fullName: string;
  title: string;
};

const resolveTestCaseStartInfo = (
  testNamesPath: Circus.TestNamesPath,
): TestDescription => {
  const ancestorTitles = testNamesPath.filter(
    name => { throw new Error("STUB"); },
  );
  const fullName = ancestorTitles.join(' ');
  const title = testNamesPath.at(-1)!;
  // remove title
  ancestorTitles.pop();
  return {
    ancestorTitles,
    fullName,
    title,
  };
};

export const parseSingleTestResult = (
  testResult: Circus.TestResult,
): TestCaseResult => {
  let status: Status;
  if (testResult.status === 'skip') {
    status = 'pending';
  } else if (testResult.status === 'todo') {
    status = 'todo';
  } else if (testResult.errors.length > 0) {
    status = 'failed';
  } else {
    status = 'passed';
  }

  const {ancestorTitles, fullName, title} = resolveTestCaseStartInfo(
    testResult.testPath,
  );

  return {
    ancestorTitles,
    duration: testResult.duration,
    failing: testResult.failing,
    failureDetails: testResult.errorsDetailed,
    failureMessages: [...testResult.errors],
    fullName,
    invocations: testResult.invocations,
    location: testResult.location,
    numPassingAsserts: testResult.numPassingAsserts,
    retryReasons: [...testResult.retryReasons],
    startedAt: testResult.startedAt,
    status,
    title,
  };
};

export const createTestCaseStartInfo = (
  test: Circus.TestEntry,
): Circus.TestCaseStartInfo => {
  const testPath = getTestNamesPath(test);
  const {ancestorTitles, fullName, title} = resolveTestCaseStartInfo(testPath);

  return {
    ancestorTitles,
    fullName,
    mode: test.mode,
    startedAt: test.startedAt,
    title,
  };
};
