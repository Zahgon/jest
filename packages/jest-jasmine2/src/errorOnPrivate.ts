/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {Global} from '@jest/types';
import {ErrorWithStack} from 'jest-util';

type DisabledGlobalKeys = 'fail' | 'pending' | 'spyOn' | 'spyOnProperty';

// prettier-ignore
const disabledGlobals: Record<DisabledGlobalKeys, string> = {
  fail: 'Illegal usage of global `fail`, prefer throwing an error, or the `done.fail` callback.',
  pending: 'Illegal usage of global `pending`, prefer explicitly skipping a test using `test.skip`',
  spyOn: 'Illegal usage of global `spyOn`, prefer `jest.spyOn`.',
  spyOnProperty: 'Illegal usage of global `spyOnProperty`, prefer `jest.spyOn`.',
};

type DisabledJasmineMethodsKeys =
  | 'addMatchers'
  | 'any'
  | 'anything'
  | 'arrayContaining'
  | 'createSpy'
  | 'objectContaining'
  | 'stringMatching';

// prettier-ignore
const disabledJasmineMethods: Record<DisabledJasmineMethodsKeys, string> = {
  addMatchers: 'Illegal usage of `jasmine.addMatchers`, prefer `expect.extends`.',
  any: 'Illegal usage of `jasmine.any`, prefer `expect.any`.',
  anything: 'Illegal usage of `jasmine.anything`, prefer `expect.anything`.',
  arrayContaining: 'Illegal usage of `jasmine.arrayContaining`, prefer `expect.arrayContaining`.',
  createSpy: 'Illegal usage of `jasmine.createSpy`, prefer `jest.fn`.',
  objectContaining: 'Illegal usage of `jasmine.objectContaining`, prefer `expect.objectContaining`.',
  stringMatching: 'Illegal usage of `jasmine.stringMatching`, prefer `expect.stringMatching`.',
};

export function installErrorOnPrivate(global: Global.Global): void {
    throw new Error("STUB");
}

function throwAtFunction(
  message: string,
  fn: (...args: Array<any>) => unknown,
) {
  throw new ErrorWithStack(message, fn);
}
