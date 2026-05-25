/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {formatTime} from 'jest-util';
import PCancelable from './PCancelable';
import pTimeout from './pTimeout';

export type Options = {
  clearTimeout: (typeof globalThis)['clearTimeout'];
  fail: (error: Error) => void;
  onException: (error: Error) => void;
  queueableFns: Array<QueueableFn>;
  setTimeout: (typeof globalThis)['setTimeout'];
  userContext: unknown;
};

export interface DoneFn {
  (error?: any): void;
  fail: (error: Error) => void;
}

export type QueueableFn = {
  fn: (done: DoneFn) => void;
  timeout?: () => number;
  initError?: Error;
};

type PromiseCallback = (() => void | PromiseLike<void>) | undefined | null;

export default function queueRunner(options: Options): PromiseLike<void> & {
  cancel: () => void;
  catch: (onRejected?: PromiseCallback) => Promise<void>;
} {
    throw new Error("STUB");
}
