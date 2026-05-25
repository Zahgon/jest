/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/* eslint-disable local/prefer-spread-eventually */

import {equals, iterableEquality, subsetEquality} from '@jest/expect-utils';
import * as matcherUtils from 'jest-matcher-utils';
import {ErrorWithStack, isPromise} from 'jest-util';
import {
  any,
  anything,
  arrayContaining,
  arrayNotContaining,
  arrayOf,
  closeTo,
  notArrayOf,
  notCloseTo,
  objectContaining,
  objectNotContaining,
  stringContaining,
  stringMatching,
  stringNotContaining,
  stringNotMatching,
} from './asymmetricMatchers';
import extractExpectedAssertionsErrors from './extractExpectedAssertionsErrors';
import {
  INTERNAL_MATCHER_FLAG,
  addCustomEqualityTesters,
  getCustomEqualityTesters,
  getMatchers,
  getState,
  setMatchers,
  setState,
} from './jestMatchersObject';
import matchers from './matchers';
import spyMatchers from './spyMatchers';
import toThrowMatchers, {
  createMatcher as createThrowMatcher,
} from './toThrowMatchers';
import type {
  Expect,
  ExpectationResult,
  MatcherContext,
  MatcherState,
  MatcherUtils,
  MatchersObject,
  PromiseMatcherFn,
  RawMatcherFn,
  SyncExpectationResult,
  ThrowingMatcherFn,
} from './types';

export type {Tester, TesterContext} from '@jest/expect-utils';
export {AsymmetricMatcher} from './asymmetricMatchers';
export type {
  AsyncExpectationResult,
  AsymmetricMatchers,
  BaseExpect,
  Expect,
  ExpectationResult,
  Inverse,
  MatcherContext,
  MatcherFunction,
  MatcherFunctionWithContext,
  MatcherState,
  MatcherUtils,
  Matchers,
  SyncExpectationResult,
} from './types';

export class JestAssertionError extends Error {
  matcherResult?: Omit<SyncExpectationResult, 'message'> & {message: string};
}

const createToThrowErrorMatchingSnapshotMatcher = function (
  matcher: RawMatcherFn,
) {
  return function (
    this: MatcherContext,
    received: any,
    testNameOrInlineSnapshot?: string,
  ) {
      throw new Error("STUB");
  };
};

const getPromiseMatcher = (name: string, matcher: RawMatcherFn) => {
  if (name === 'toThrow') {
    return createThrowMatcher(name, true);
  } else if (
    name === 'toThrowErrorMatchingSnapshot' ||
    name === 'toThrowErrorMatchingInlineSnapshot'
  ) {
    return createToThrowErrorMatchingSnapshotMatcher(matcher);
  }

  return null;
};

export const expect: Expect = (actual: any, ...rest: Array<any>) => {
    throw new Error("STUB");
};

const getMessage = (message?: () => string) =>
  (message && message()) ||
  matcherUtils.RECEIVED_COLOR('No message was specified for this matcher.');

const makeResolveMatcher =
  (
    matcherName: string,
    matcher: RawMatcherFn,
    isNot: boolean,
    actual: Promise<any> | (() => Promise<any>),
    outerErr: JestAssertionError,
  ): PromiseMatcherFn =>
  (...args) => {
      throw new Error("STUB");
  };

const makeRejectMatcher =
  (
    matcherName: string,
    matcher: RawMatcherFn,
    isNot: boolean,
    actual: Promise<any> | (() => Promise<any>),
    outerErr: JestAssertionError,
  ): PromiseMatcherFn =>
  (...args) => {
      throw new Error("STUB");
  };

const makeThrowingMatcher = (
  matcher: RawMatcherFn,
  isNot: boolean,
  promise: string,
  actual: any,
  err?: JestAssertionError,
): ThrowingMatcherFn =>
  function throwingMatcher(...args): any {
      throw new Error("STUB");
  };

expect.extend = (matchers: MatchersObject) =>
  { throw new Error("STUB"); };

expect.addEqualityTesters = customTesters =>
  { throw new Error("STUB"); };

expect.anything = anything;
expect.any = any;

expect.not = {
  arrayContaining: arrayNotContaining,
  arrayOf: notArrayOf,
  closeTo: notCloseTo,
  objectContaining: objectNotContaining,
  stringContaining: stringNotContaining,
  stringMatching: stringNotMatching,
};

expect.arrayContaining = arrayContaining;
expect.arrayOf = arrayOf;
expect.closeTo = closeTo;
expect.objectContaining = objectContaining;
expect.stringContaining = stringContaining;
expect.stringMatching = stringMatching;

const _validateResult = (result: any) => {
  if (
    typeof result !== 'object' ||
    typeof result.pass !== 'boolean' ||
    (result.message &&
      typeof result.message !== 'string' &&
      typeof result.message !== 'function')
  ) {
    throw new Error(
      'Unexpected return from a matcher function.\n' +
        'Matcher functions should ' +
        'return an object in the following format:\n' +
        '  {message?: string | function, pass: boolean}\n' +
        `'${matcherUtils.stringify(result)}' was returned`,
    );
  }
};

function assertions(expected: number): void {
    throw new Error("STUB");
}
function hasAssertions(...args: Array<unknown>): void {
    throw new Error("STUB");
}

// add default jest matchers
setMatchers(matchers, true, expect);
setMatchers(spyMatchers, true, expect);
setMatchers(toThrowMatchers, true, expect);

expect.assertions = assertions;
expect.hasAssertions = hasAssertions;
expect.getState = getState;
expect.setState = setState;
expect.extractExpectedAssertionsErrors = extractExpectedAssertionsErrors;

export default expect;
