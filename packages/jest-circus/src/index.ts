/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {Circus, Global} from '@jest/types';
import {bind as bindEach} from 'jest-each';
import {ErrorWithStack, convertDescriptorToString, isPromise} from 'jest-util';
import {dispatchSync} from './state';

export {
  setState,
  getState,
  resetState,
  addEventHandler,
  removeEventHandler,
} from './state';
export {default as run} from './run';

type THook = (fn: Circus.HookFn, timeout?: number) => void;
type DescribeFn = (
  blockName: Circus.BlockNameLike,
  blockFn: Circus.BlockFn,
) => void;

const describe = (() => {
    throw new Error("STUB");
})();

const _dispatchDescribe = (
  blockFn: Circus.BlockFn,
  blockName: Circus.BlockNameLike,
  describeFn: DescribeFn,
  mode?: Circus.BlockMode,
) => {
  const asyncError = new ErrorWithStack(undefined, describeFn);
  if (blockFn === undefined) {
    asyncError.message =
      'Missing second argument. It must be a callback function.';
    throw asyncError;
  }
  if (typeof blockFn !== 'function') {
    asyncError.message = `Invalid second argument, ${blockFn}. It must be a callback function.`;
    throw asyncError;
  }
  try {
    blockName = convertDescriptorToString(blockName);
  } catch (error) {
    asyncError.message = (error as Error).message;
    throw asyncError;
  }

  dispatchSync({
    asyncError,
    blockName,
    mode,
    name: 'start_describe_definition',
  });
  const describeReturn = blockFn();

  if (isPromise(describeReturn)) {
    throw new ErrorWithStack(
      'Returning a Promise from "describe" is not supported. Tests must be defined synchronously.',
      describeFn,
    );
  } else if (describeReturn !== undefined) {
    throw new ErrorWithStack(
      'A "describe" callback must not return a value.',
      describeFn,
    );
  }

  dispatchSync({blockName, mode, name: 'finish_describe_definition'});
};

const _addHook = (
  fn: Circus.HookFn,
  hookType: Circus.HookType,
  hookFn: THook,
  timeout?: number,
) => {
  const asyncError = new ErrorWithStack(undefined, hookFn);

  if (typeof fn !== 'function') {
    asyncError.message =
      'Invalid first argument. It must be a callback function.';

    throw asyncError;
  }

  dispatchSync({asyncError, fn, hookType, name: 'add_hook', timeout});
};

// Hooks have to pass themselves to the HOF in order for us to trim stack traces.
const beforeEach: THook = (fn, timeout) =>
  _addHook(fn, 'beforeEach', beforeEach, timeout);
const beforeAll: THook = (fn, timeout) =>
  _addHook(fn, 'beforeAll', beforeAll, timeout);
const afterEach: THook = (fn, timeout) =>
  _addHook(fn, 'afterEach', afterEach, timeout);
const afterAll: THook = (fn, timeout) =>
  _addHook(fn, 'afterAll', afterAll, timeout);

const test: Global.It = (() => {
    throw new Error("STUB");
})();

const it: Global.It = test;

export type Event = Circus.Event;
export type State = Circus.State;
export {afterAll, afterEach, beforeAll, beforeEach, describe, it, test};
export default {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  it,
  test,
};
