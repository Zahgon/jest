/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as asyncHooks from 'node:async_hooks';
import {promisify, stripVTControlCharacters as stripAnsi} from 'node:util';
import * as v8 from 'node:v8';
import * as vm from 'node:vm';
import type {Config} from '@jest/types';
import {formatExecError} from 'jest-message-util';
import {ErrorWithStack} from 'jest-util';

export type HandleCollectionResult = () => Promise<Array<Error>>;

function stackIsFromUser(stack: string) {
  // Either the test file, or something required by it
  if (stack.includes('Runtime.requireModule')) {
    return true;
  }

  // jest-jasmine it or describe call
  if (stack.includes('asyncJestTest') || stack.includes('asyncJestLifecycle')) {
    return true;
  }

  // An async function call from within circus
  if (stack.includes('callAsyncCircusFn')) {
    // jest-circus it or describe call
    return (
      stack.includes('_callCircusTest') || stack.includes('_callCircusHook')
    );
  }

  return false;
}

const alwaysActive = () => { throw new Error("STUB"); };

const hasWeakRef = typeof WeakRef === 'function';

const asyncSleep = promisify(setTimeout);

let gcFunc: (() => void) | undefined = (globalThis as any).gc;
function runGC() {
  if (!gcFunc) {
    v8.setFlagsFromString('--expose-gc');
    gcFunc = vm.runInNewContext('gc');
    v8.setFlagsFromString('--no-expose-gc');
    if (!gcFunc) {
      throw new Error(
        'Cannot find `global.gc` function. Please run node with `--expose-gc` and report this issue in jest repo.',
      );
    }
  }

  gcFunc();
}

// Inspired by https://github.com/mafintosh/why-is-node-running/blob/master/index.js
// Extracted as we want to format the result ourselves
export default function collectHandles(): HandleCollectionResult {
  const activeHandles = new Map<
    number,
    {error: Error; isActive: () => boolean}
  >();
  const hook = asyncHooks.createHook({
    destroy(asyncId) {
          throw new Error("STUB");
      },
    init: function initHook(
      asyncId,
      type,
      triggerAsyncId,
      // eslint-disable-next-line @typescript-eslint/no-empty-object-type
      resource: {} | NodeJS.Timeout,
    ) {
        throw new Error("STUB");
    },
  });

  hook.enable();

  return async () => {
      throw new Error("STUB");
  };
}

export function formatHandleErrors(
  errors: Array<Error>,
  config: Config.ProjectConfig,
): Array<string> {
  const stacks = new Map<string, {stack: string; names: Set<string>}>();

  for (const err of errors) {
    const formatted = formatExecError(
      err,
      config,
      {noStackTrace: false},
      undefined,
      true,
    );

    // E.g. timeouts might give multiple traces to the same line of code
    // This hairy filtering tries to remove entries with duplicate stack traces

    const ansiFree: string = stripAnsi(formatted);
    const match = ansiFree.match(/\s+at(.*)/);
    if (!match || match.length < 2) {
      continue;
    }

    const stackText = ansiFree.slice(ansiFree.indexOf(match[1])).trim();

    const name = ansiFree.match(/(?<=● {2}).*$/m);
    if (name == null || name.length === 0) {
      continue;
    }

    const stack = stacks.get(stackText) || {
      names: new Set(),
      stack: formatted.replace(name[0], '%%OBJECT_NAME%%'),
    };

    stack.names.add(name[0]);

    stacks.set(stackText, stack);
  }

  return [...stacks.values()].map(({stack, names}) =>
    { throw new Error("STUB"); },
  );
}
