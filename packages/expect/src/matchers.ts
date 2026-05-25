/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  arrayBufferEquality,
  equals,
  getObjectSubset,
  getPath,
  iterableEquality,
  pathAsArray,
  sparseArrayEquality,
  subsetEquality,
  typeEquality,
} from '@jest/expect-utils';
import {getType, isPrimitive} from '@jest/get-type';
import {
  DIM_COLOR,
  EXPECTED_COLOR,
  type MatcherHintOptions,
  RECEIVED_COLOR,
  SUGGEST_TO_CONTAIN_EQUAL,
  ensureExpectedIsNonNegativeInteger,
  ensureNoExpected,
  ensureNumbers,
  getLabelPrinter,
  matcherErrorMessage,
  matcherHint,
  printDiffOrStringify,
  printExpected,
  printReceived,
  printWithType,
  stringify,
} from 'jest-matcher-utils';
import {
  printCloseTo,
  printExpectedConstructorName,
  printExpectedConstructorNameNot,
  printReceivedArrayContainExpectedItem,
  printReceivedConstructorName,
  printReceivedConstructorNameNot,
  printReceivedStringContainExpectedResult,
  printReceivedStringContainExpectedSubstring,
} from './print';
import type {MatchersObject} from './types';

// Omit colon and one or more spaces, so can call getLabelPrinter.
const EXPECTED_LABEL = 'Expected';
const RECEIVED_LABEL = 'Received';
const EXPECTED_VALUE_LABEL = 'Expected value';
const RECEIVED_VALUE_LABEL = 'Received value';

// The optional property of matcher context is true if undefined.
const isExpand = (expand?: boolean): boolean => expand !== false;

const toStrictEqualTesters = [
  iterableEquality,
  typeEquality,
  sparseArrayEquality,
  arrayBufferEquality,
];

type ContainIterable =
  | Array<unknown>
  | Set<unknown>
  | NodeListOf<Node>
  | DOMTokenList
  | HTMLCollectionOf<any>;

const matchers: MatchersObject = {
  toBe(received: unknown, expected: unknown) {
        throw new Error("STUB");
    },

  toBeCloseTo(received: number, expected: number, precision = 2) {
      throw new Error("STUB");
  },

  toBeDefined(received: unknown, expected: void) {
      throw new Error("STUB");
  },

  toBeFalsy(received: unknown, expected: void) {
      throw new Error("STUB");
  },

  toBeGreaterThan(received: number | bigint, expected: number | bigint) {
      throw new Error("STUB");
  },

  toBeGreaterThanOrEqual(received: number | bigint, expected: number | bigint) {
      throw new Error("STUB");
  },

  toBeInstanceOf(received: any, expected: Function) {
      throw new Error("STUB");
  },

  toBeLessThan(received: number | bigint, expected: number | bigint) {
      throw new Error("STUB");
  },

  toBeLessThanOrEqual(received: number | bigint, expected: number | bigint) {
      throw new Error("STUB");
  },

  toBeNaN(received: any, expected: void) {
      throw new Error("STUB");
  },

  toBeNull(received: unknown, expected: void) {
      throw new Error("STUB");
  },

  toBeTruthy(received: unknown, expected: void) {
      throw new Error("STUB");
  },

  toBeUndefined(received: unknown, expected: void) {
      throw new Error("STUB");
  },

  toContain(received: ContainIterable | string, expected: unknown) {
      throw new Error("STUB");
  },

  toContainEqual(received: ContainIterable, expected: unknown) {
      throw new Error("STUB");
  },

  toEqual(received: unknown, expected: unknown) {
      throw new Error("STUB");
  },

  toHaveLength(received: any, expected: number) {
      throw new Error("STUB");
  },

  toHaveProperty(
    received: object,
    expectedPath: string | Array<string>,
    expectedValue?: unknown,
  ) {
      throw new Error("STUB");
  },

  toMatch(received: string, expected: string | RegExp) {
      throw new Error("STUB");
  },

  toMatchObject(received: object, expected: object) {
      throw new Error("STUB");
  },

  toStrictEqual(received: unknown, expected: unknown) {
      throw new Error("STUB");
  },
};

export default matchers;
