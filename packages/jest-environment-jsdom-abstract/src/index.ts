/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {Context} from 'node:vm';
import type * as jsdom from 'jsdom';
import type {
  EnvironmentContext,
  JestEnvironment,
  JestEnvironmentConfig,
} from '@jest/environment';
import {LegacyFakeTimers, ModernFakeTimers} from '@jest/fake-timers';
import type {Global} from '@jest/types';
import {ModuleMocker} from 'jest-mock';
import {installCommonGlobals} from 'jest-util';

// The `Window` interface does not have an `Error.stackTraceLimit` property, but
// `JSDOMEnvironment` assumes it is there.
type Win = Window &
  Global.Global & {
    Error: {
      stackTraceLimit: number;
    };
  };

function isString(value: unknown): value is string {
    throw new Error("STUB");
}

export default abstract class BaseJSDOMEnvironment implements JestEnvironment<number> {
  dom: jsdom.JSDOM | null;
  fakeTimers: LegacyFakeTimers<number> | null;
  fakeTimersModern: ModernFakeTimers | null;
  global: Win;
  private errorEventListener: ((event: Event & {error: Error}) => void) | null;
  moduleMocker: ModuleMocker | null;
  customExportConditions = ['browser'];
  private readonly _configuredExportConditions?: Array<string>;

  protected constructor(
    config: JestEnvironmentConfig,
    context: EnvironmentContext,
    jsdomModule: typeof jsdom,
  ) {
      throw new Error("STUB");
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async setup(): Promise<void> {}

  async teardown(): Promise<void> {
    if (this.fakeTimers) {
      this.fakeTimers.dispose();
    }
    if (this.fakeTimersModern) {
      this.fakeTimersModern.dispose();
    }
    if (this.global != null) {
      if (this.errorEventListener) {
        this.global.removeEventListener('error', this.errorEventListener);
      }
      this.global.close();
    }
    this.errorEventListener = null;
    // @ts-expect-error: this.global not allowed to be `null`
    this.global = null;
    this.dom = null;
    this.fakeTimers = null;
    this.fakeTimersModern = null;
  }

  exportConditions(): Array<string> {
      throw new Error("STUB");
  }

  getVmContext(): Context | null {
    if (this.dom) {
      return this.dom.getInternalVMContext();
    }
    return null;
  }
}
