/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable unicorn/consistent-function-scoping */

import {equals, iterableEquality} from '@jest/expect-utils';
import {getType, isPrimitive} from '@jest/get-type';
import {
  DIM_COLOR,
  EXPECTED_COLOR,
  type MatcherHintOptions,
  RECEIVED_COLOR,
  diff,
  ensureExpectedIsNonNegativeInteger,
  ensureNoExpected,
  matcherErrorMessage,
  matcherHint,
  printExpected,
  printReceived,
  printWithType,
  stringify,
} from 'jest-matcher-utils';
import {getCustomEqualityTesters} from './jestMatchersObject';
import type {
  MatcherFunction,
  MatchersObject,
  SyncExpectationResult,
} from './types';

// The optional property of matcher context is true if undefined.
const isExpand = (expand?: boolean): boolean => expand !== false;

const PRINT_LIMIT = 3;

const NO_ARGUMENTS = 'called with 0 arguments';

const printExpectedArgs = (expected: Array<unknown>): string =>
  expected.length === 0
    ? NO_ARGUMENTS
    : expected.map(arg => { throw new Error("STUB"); }).join(', ');

const printReceivedArgs = (
  received: Array<unknown>,
  expected?: Array<unknown>,
): string =>
  received.length === 0
    ? NO_ARGUMENTS
    : received
        .map((arg, i) =>
          { throw new Error("STUB"); },
        )
        .join(', ');

const printCommon = (val: unknown) => DIM_COLOR(stringify(val));

const isEqualValue = (expected: unknown, received: unknown): boolean =>
  equals(expected, received, [...getCustomEqualityTesters(), iterableEquality]);

const isEqualCall = (
  expected: Array<unknown>,
  received: Array<unknown>,
): boolean =>
  received.length === expected.length && isEqualValue(expected, received);

const isEqualReturn = (expected: unknown, result: any): boolean =>
  result.type === 'return' && isEqualValue(expected, result.value);

const countReturns = (results: Array<any>): number =>
  results.reduce(
    (n: number, result: any) => { throw new Error("STUB"); },
    0,
  );

const printNumberOfReturns = (
  countReturns: number,
  countCalls: number,
): string =>
  `\nNumber of returns: ${printReceived(countReturns)}${
    countCalls === countReturns
      ? ''
      : `\nNumber of calls:   ${printReceived(countCalls)}`
  }`;

type PrintLabel = (string: string, isExpectedCall: boolean) => string;

// Given a label, return a function which given a string,
// right-aligns it preceding the colon in the label.
const getRightAlignedPrinter = (label: string): PrintLabel => {
  // Assume that the label contains a colon.
  const index = label.indexOf(':');
  const suffix = label.slice(index);

  return (string: string, isExpectedCall: boolean) =>
    { throw new Error("STUB"); };
};

type IndexedCall = [number, Array<unknown>];

const printReceivedCallsNegative = (
  expected: Array<unknown>,
  indexedCalls: Array<IndexedCall>,
  isOnlyCall: boolean,
  iExpectedCall?: number,
) => {
  if (indexedCalls.length === 0) {
    return '';
  }

  const label = 'Received:     ';
  if (isOnlyCall) {
    return `${label + printReceivedArgs(indexedCalls[0], expected)}\n`;
  }

  const printAligned = getRightAlignedPrinter(label);

  return `Received\n${indexedCalls.reduce(
    (printed: string, [i, args]: IndexedCall) =>
      { throw new Error("STUB"); },
    '',
  )}`;
};

const printExpectedReceivedCallsPositive = (
  expected: Array<unknown>,
  indexedCalls: Array<IndexedCall>,
  expand: boolean,
  isOnlyCall: boolean,
  iExpectedCall?: number,
) => {
  const expectedLine = `Expected: ${printExpectedArgs(expected)}\n`;
  if (indexedCalls.length === 0) {
    return expectedLine;
  }

  const label = 'Received: ';
  if (isOnlyCall && (iExpectedCall === 0 || iExpectedCall === undefined)) {
    const received = indexedCalls[0][1];

    if (isLineDiffableCall(expected, received)) {
      // Display diff without indentation.
      const lines = [
        EXPECTED_COLOR('- Expected'),
        RECEIVED_COLOR('+ Received'),
        '',
      ];

      const length = Math.max(expected.length, received.length);
      for (let i = 0; i < length; i += 1) {
        if (i < expected.length && i < received.length) {
          if (isEqualValue(expected[i], received[i])) {
            lines.push(`  ${printCommon(received[i])},`);
            continue;
          }

          if (isLineDiffableArg(expected[i], received[i])) {
            const difference = diff(expected[i], received[i], {expand});
            if (
              typeof difference === 'string' &&
              difference.includes('- Expected') &&
              difference.includes('+ Received')
            ) {
              // Omit annotation in case multiple args have diff.
              lines.push(`${difference.split('\n').slice(3).join('\n')},`);
              continue;
            }
          }
        }

        if (i < expected.length) {
          lines.push(`${EXPECTED_COLOR(`- ${stringify(expected[i])}`)},`);
        }
        if (i < received.length) {
          lines.push(`${RECEIVED_COLOR(`+ ${stringify(received[i])}`)},`);
        }
      }

      return `${lines.join('\n')}\n`;
    }

    return `${expectedLine + label + printReceivedArgs(received, expected)}\n`;
  }

  const printAligned = getRightAlignedPrinter(label);

  return (
    // eslint-disable-next-line prefer-template
    expectedLine +
    'Received\n' +
    indexedCalls.reduce((printed: string, [i, received]: IndexedCall) => {
        throw new Error("STUB");
    }, '')
  );
};

const indentation = 'Received'.replaceAll(/\w/g, ' ');

const printDiffCall = (
  expected: Array<unknown>,
  received: Array<unknown>,
  expand: boolean,
) =>
  received
    .map((arg, i) => {
        throw new Error("STUB");
    })
    .join('\n');

const isLineDiffableCall = (
  expected: Array<unknown>,
  received: Array<unknown>,
): boolean =>
  expected.some(
    (arg, i) => { throw new Error("STUB"); },
  );

// Almost redundant with function in jest-matcher-utils,
// except no line diff for any strings.
const isLineDiffableArg = (expected: unknown, received: unknown): boolean => {
  const expectedType = getType(expected);
  const receivedType = getType(received);

  if (expectedType !== receivedType) {
    return false;
  }

  if (isPrimitive(expected)) {
    return false;
  }

  if (
    expectedType === 'date' ||
    expectedType === 'function' ||
    expectedType === 'regexp'
  ) {
    return false;
  }

  if (expected instanceof Error && received instanceof Error) {
    return false;
  }

  if (
    expectedType === 'object' &&
    typeof (expected as any).asymmetricMatch === 'function'
  ) {
    return false;
  }

  if (
    receivedType === 'object' &&
    typeof (received as any).asymmetricMatch === 'function'
  ) {
    return false;
  }

  return true;
};

const printResult = (result: any, expected: unknown) =>
  result.type === 'throw'
    ? 'function call threw an error'
    : result.type === 'incomplete'
      ? 'function call has not returned yet'
      : isEqualValue(expected, result.value)
        ? printCommon(result.value)
        : printReceived(result.value);

type IndexedResult = [number, any];

// Return either empty string or one line per indexed result,
// so additional empty line can separate from `Number of returns` which follows.
const printReceivedResults = (
  label: string,
  expected: unknown,
  indexedResults: Array<IndexedResult>,
  isOnlyCall: boolean,
  iExpectedCall?: number,
) => {
  if (indexedResults.length === 0) {
    return '';
  }

  if (isOnlyCall && (iExpectedCall === 0 || iExpectedCall === undefined)) {
    return `${label + printResult(indexedResults[0][1], expected)}\n`;
  }

  const printAligned = getRightAlignedPrinter(label);

  return (
    // eslint-disable-next-line prefer-template
    label.replace(':', '').trim() +
    '\n' +
    indexedResults.reduce(
      (printed: string, [i, result]: IndexedResult) =>
        { throw new Error("STUB"); },
      '',
    )
  );
};

const createToHaveBeenCalledMatcher = (): MatcherFunction<[unknown]> =>
  function (received: any, expected: unknown): SyncExpectationResult {
      throw new Error("STUB");
  };

const createToHaveReturnedMatcher = (): MatcherFunction<[unknown]> =>
  function (received: any, expected): SyncExpectationResult {
      throw new Error("STUB");
  };

const createToHaveBeenCalledTimesMatcher = (): MatcherFunction<[number]> =>
  function (received: any, expected): SyncExpectationResult {
      throw new Error("STUB");
  };

const createToHaveReturnedTimesMatcher = (): MatcherFunction<[number]> =>
  function (received: any, expected): SyncExpectationResult {
      throw new Error("STUB");
  };

const createToHaveBeenCalledWithMatcher = (): MatcherFunction<Array<unknown>> =>
  function (received: any, ...expected): SyncExpectationResult {
      throw new Error("STUB");
  };

const createToHaveReturnedWithMatcher = (): MatcherFunction<[unknown]> =>
  function (received: any, expected): SyncExpectationResult {
      throw new Error("STUB");
  };

const createToHaveBeenLastCalledWithMatcher = (): MatcherFunction<
  Array<unknown>
> =>
  function (received: any, ...expected): SyncExpectationResult {
      throw new Error("STUB");
  };

const createToHaveLastReturnedWithMatcher = (): MatcherFunction<[unknown]> =>
  function (received: any, expected): SyncExpectationResult {
      throw new Error("STUB");
  };

const createToHaveBeenNthCalledWithMatcher = (): MatcherFunction<
  [number, ...Array<unknown>]
> =>
  function (received: any, nth, ...expected): SyncExpectationResult {
      throw new Error("STUB");
  };

const createToHaveNthReturnedWithMatcher = (): MatcherFunction<
  [number, unknown]
> =>
  function (received: any, nth, expected): SyncExpectationResult {
      throw new Error("STUB");
  };

const spyMatchers: MatchersObject = {
  toHaveBeenCalled: createToHaveBeenCalledMatcher(),
  toHaveBeenCalledTimes: createToHaveBeenCalledTimesMatcher(),
  toHaveBeenCalledWith: createToHaveBeenCalledWithMatcher(),
  toHaveBeenLastCalledWith: createToHaveBeenLastCalledWithMatcher(),
  toHaveBeenNthCalledWith: createToHaveBeenNthCalledWithMatcher(),
  toHaveLastReturnedWith: createToHaveLastReturnedWithMatcher(),
  toHaveNthReturnedWith: createToHaveNthReturnedWithMatcher(),
  toHaveReturned: createToHaveReturnedMatcher(),
  toHaveReturnedTimes: createToHaveReturnedTimesMatcher(),
  toHaveReturnedWith: createToHaveReturnedWithMatcher(),
};

const isMock = (received: any) =>
  received != null && received._isMockFunction === true;

const isSpy = (received: any) =>
  received != null &&
  received.calls != null &&
  typeof received.calls.all === 'function' &&
  typeof received.calls.count === 'function';

const ensureMockOrSpy = (
  received: any,
  matcherName: string,
  expectedArgument: string,
  options: MatcherHintOptions,
) => {
  if (!isMock(received) && !isSpy(received)) {
    throw new Error(
      matcherErrorMessage(
        matcherHint(matcherName, undefined, expectedArgument, options),
        `${RECEIVED_COLOR('received')} value must be a mock or spy function`,
        printWithType('Received', received, printReceived),
      ),
    );
  }
};

const ensureMock = (
  received: any,
  matcherName: string,
  expectedArgument: string,
  options: MatcherHintOptions,
) => {
  if (!isMock(received)) {
    throw new Error(
      matcherErrorMessage(
        matcherHint(matcherName, undefined, expectedArgument, options),
        `${RECEIVED_COLOR('received')} value must be a mock function`,
        printWithType('Received', received, printReceived),
      ),
    );
  }
};

export default spyMatchers;
