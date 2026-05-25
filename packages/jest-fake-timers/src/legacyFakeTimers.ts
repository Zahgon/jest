/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable local/prefer-spread-eventually */

import {promisify} from 'node:util';
import {type StackTraceConfig, formatStackTrace} from 'jest-message-util';
import type {
  FunctionLike,
  Mock,
  ModuleMocker,
  UnknownFunction,
} from 'jest-mock';
import {setGlobal} from 'jest-util';

type Callback = (...args: Array<unknown>) => void;
type TemporalDurationLike = {total(options: {unit: string}): number};

type TimerID = string;

type Tick = {
  uuid: string;
  callback: Callback;
};

type Timer = {
  type: string;
  callback: Callback;
  expiry: number;
  interval?: number;
};

type TimerAPI = {
  cancelAnimationFrame: typeof globalThis.cancelAnimationFrame;
  clearImmediate: typeof globalThis.clearImmediate;
  clearInterval: typeof globalThis.clearInterval;
  clearTimeout: typeof globalThis.clearTimeout;
  nextTick: typeof process.nextTick;
  requestAnimationFrame: typeof globalThis.requestAnimationFrame;
  setImmediate: typeof globalThis.setImmediate;
  setInterval: typeof globalThis.setInterval;
  setTimeout: typeof globalThis.setTimeout;
};

type FakeTimerAPI = {
  cancelAnimationFrame: Mock<FakeTimers['_fakeClearTimer']>;
  clearImmediate: Mock<FakeTimers['_fakeClearImmediate']>;
  clearInterval: Mock<FakeTimers['_fakeClearTimer']>;
  clearTimeout: Mock<FakeTimers['_fakeClearTimer']>;
  nextTick: Mock<FakeTimers['_fakeNextTick']>;
  requestAnimationFrame: Mock<FakeTimers['_fakeRequestAnimationFrame']>;
  setImmediate: Mock<FakeTimers['_fakeSetImmediate']>;
  setInterval: Mock<FakeTimers['_fakeSetInterval']>;
  setTimeout: Mock<FakeTimers['_fakeSetTimeout']>;
};

type TimerConfig<Ref> = {
  idToRef: (id: number) => Ref;
  refToId: (ref: Ref) => number | void;
};

const MS_IN_A_YEAR = 31_536_000_000;

export default class FakeTimers<TimerRef = unknown> {
  private _cancelledTicks!: Record<string, boolean>;
  private readonly _config: StackTraceConfig;
  private _disposed: boolean;
  private _fakeTimerAPIs!: FakeTimerAPI;
  private _fakingTime = false;
  private readonly _global: typeof globalThis;
  private _immediates!: Array<Tick>;
  private readonly _maxLoops: number;
  private readonly _moduleMocker: ModuleMocker;
  private _now!: number;
  private _ticks!: Array<Tick>;
  private readonly _timerAPIs: TimerAPI;
  private _timers!: Map<string, Timer>;
  private _uuidCounter: number;
  private readonly _timerConfig: TimerConfig<TimerRef>;

  constructor({
    global,
    moduleMocker,
    timerConfig,
    config,
    maxLoops,
  }: {
    global: typeof globalThis;
    moduleMocker: ModuleMocker;
    timerConfig: TimerConfig<TimerRef>;
    config: StackTraceConfig;
    maxLoops?: number;
  }) {
      throw new Error("STUB");
  }

  clearAllTimers(): void {
    this._immediates = [];
    this._timers.clear();
  }

  dispose(): void {
    this._disposed = true;
    this.clearAllTimers();
  }

  reset(): void {
    this._cancelledTicks = {};
    this._now = 0;
    this._ticks = [];
    this._immediates = [];
    this._timers = new Map();
  }

  now(): number {
    if (this._fakingTime) {
      return this._now;
    }
    return Date.now();
  }

  runAllTicks(): void {
      throw new Error("STUB");
  }

  runAllImmediates(): void {
    this._checkFakeTimers();
    // Only run a generous number of immediates and then bail.
    let i;
    for (i = 0; i < this._maxLoops; i++) {
      const immediate = this._immediates.shift();
      if (immediate === undefined) {
        break;
      }
      this._runImmediate(immediate);
    }

    if (i === this._maxLoops) {
      throw new Error(
        `Ran ${this._maxLoops} immediates, and there are still more! Assuming ` +
          "we've hit an infinite recursion and bailing out...",
      );
    }
  }

  private _runImmediate(immediate: Tick) {
    try {
      immediate.callback();
    } finally {
      this._fakeClearImmediate(immediate.uuid);
    }
  }

  runAllTimers(): void {
      throw new Error("STUB");
  }

  runOnlyPendingTimers(): void {
      throw new Error("STUB");
  }

  advanceTimersToNextTimer(steps = 1): void {
      throw new Error("STUB");
  }

  advanceTimersByTime(msToRun: number | TemporalDurationLike): void {
      throw new Error("STUB");
  }

  runWithRealTimers(cb: Callback): void {
      throw new Error("STUB");
  }

  useRealTimers(): void {
    const global = this._global;

    if (typeof global.cancelAnimationFrame === 'function') {
      setGlobal(
        global,
        'cancelAnimationFrame',
        this._timerAPIs.cancelAnimationFrame,
      );
    }
    if (typeof global.clearImmediate === 'function') {
      setGlobal(global, 'clearImmediate', this._timerAPIs.clearImmediate);
    }
    setGlobal(global, 'clearInterval', this._timerAPIs.clearInterval);
    setGlobal(global, 'clearTimeout', this._timerAPIs.clearTimeout);
    if (typeof global.requestAnimationFrame === 'function') {
      setGlobal(
        global,
        'requestAnimationFrame',
        this._timerAPIs.requestAnimationFrame,
      );
    }
    if (typeof global.setImmediate === 'function') {
      setGlobal(global, 'setImmediate', this._timerAPIs.setImmediate);
    }
    setGlobal(global, 'setInterval', this._timerAPIs.setInterval);
    setGlobal(global, 'setTimeout', this._timerAPIs.setTimeout);

    global.process.nextTick = this._timerAPIs.nextTick;

    this._fakingTime = false;
  }

  useFakeTimers(): void {
    this._createMocks();

    const global = this._global;
    if (typeof global.cancelAnimationFrame === 'function') {
      setGlobal(
        global,
        'cancelAnimationFrame',
        this._fakeTimerAPIs.cancelAnimationFrame,
      );
    }
    if (typeof global.clearImmediate === 'function') {
      setGlobal(global, 'clearImmediate', this._fakeTimerAPIs.clearImmediate);
    }
    setGlobal(global, 'clearInterval', this._fakeTimerAPIs.clearInterval);
    setGlobal(global, 'clearTimeout', this._fakeTimerAPIs.clearTimeout);
    if (typeof global.requestAnimationFrame === 'function') {
      setGlobal(
        global,
        'requestAnimationFrame',
        this._fakeTimerAPIs.requestAnimationFrame,
      );
    }
    if (typeof global.setImmediate === 'function') {
      setGlobal(global, 'setImmediate', this._fakeTimerAPIs.setImmediate);
    }
    setGlobal(global, 'setInterval', this._fakeTimerAPIs.setInterval);
    setGlobal(global, 'setTimeout', this._fakeTimerAPIs.setTimeout);

    global.process.nextTick = this._fakeTimerAPIs.nextTick;

    this._fakingTime = true;
  }

  getTimerCount(): number {
      throw new Error("STUB");
  }

  private _checkFakeTimers() {
    if (!this._fakingTime) {
      this._global.console.warn(
        'A function to advance timers was called but the timers APIs are not mocked ' +
          'with fake timers. Call `jest.useFakeTimers({legacyFakeTimers: true})` ' +
          'in this test file or enable fake timers for all tests by setting ' +
          "{'enableGlobally': true, 'legacyFakeTimers': true} in " +
          `Jest configuration file.\nStack Trace:\n${formatStackTrace(
            // eslint-disable-next-line unicorn/error-message
            new Error().stack!,
            this._config,
            {noStackTrace: false},
          )}`,
      );
    }
  }

  #createMockFunction<T extends FunctionLike = UnknownFunction>(
    implementation: T,
  ) {
      throw new Error("STUB");
  }

  private _createMocks() {
    const promisifiableFakeSetTimeout = this.#createMockFunction(
      this._fakeSetTimeout,
    );
    // @ts-expect-error: no index
    promisifiableFakeSetTimeout[promisify.custom] = (
      delay?: number,
      arg?: unknown,
    ) =>
      { throw new Error("STUB"); };

    this._fakeTimerAPIs = {
      cancelAnimationFrame: this.#createMockFunction(this._fakeClearTimer),
      clearImmediate: this.#createMockFunction(this._fakeClearImmediate),
      clearInterval: this.#createMockFunction(this._fakeClearTimer),
      clearTimeout: this.#createMockFunction(this._fakeClearTimer),
      nextTick: this.#createMockFunction(this._fakeNextTick),
      requestAnimationFrame: this.#createMockFunction(
        this._fakeRequestAnimationFrame,
      ),
      setImmediate: this.#createMockFunction(this._fakeSetImmediate),
      setInterval: this.#createMockFunction(this._fakeSetInterval),
      setTimeout: promisifiableFakeSetTimeout,
    };
  }

  private _fakeClearTimer(timerRef: TimerRef) {
      throw new Error("STUB");
  }

  private _fakeClearImmediate(uuid: TimerID) {
    this._immediates = this._immediates.filter(
      immediate => { throw new Error("STUB"); },
    );
  }

  private _fakeNextTick(callback: Callback, ...args: Array<unknown>) {
      throw new Error("STUB");
  }

  private _fakeRequestAnimationFrame(callback: Callback) {
      throw new Error("STUB");
  }

  private _fakeSetImmediate(callback: Callback, ...args: Array<unknown>) {
      throw new Error("STUB");
  }

  private _fakeSetInterval(
    callback: Callback,
    intervalDelay?: number,
    ...args: Array<unknown>
  ) {
      throw new Error("STUB");
  }

  private _fakeSetTimeout(
    callback: Callback,
    delay?: number,
    ...args: Array<unknown>
  ) {
      throw new Error("STUB");
  }

  private _getNextTimerHandleAndExpiry(): [string, number] | null {
      throw new Error("STUB");
  }

  private _runTimerHandle(timerHandle: TimerID) {
      throw new Error("STUB");
  }
}
