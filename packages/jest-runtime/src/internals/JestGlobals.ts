/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {SyntheticModule, Context as VMContext} from 'node:vm';
import type {Jest, JestEnvironment} from '@jest/environment';
import type {LegacyFakeTimers, ModernFakeTimers} from '@jest/fake-timers';
import type {expect} from '@jest/globals';
import type {Config} from '@jest/types';
import type {ModuleMocker} from 'jest-mock';
import type {MockState} from './MockState';
import type {TestState} from './TestState';
import {syntheticFromExports} from './syntheticBuilders';
import type {EnvironmentGlobals, JestGlobalsWithJest} from './types';

const testTimeoutSymbol = Symbol.for('TEST_TIMEOUT_SYMBOL');
const retryTimesSymbol = Symbol.for('RETRY_TIMES');
const waitBeforeRetrySymbol = Symbol.for('WAIT_BEFORE_RETRY');
const retryImmediatelySymbol = Symbol.for('RETRY_IMMEDIATELY');
const logErrorsBeforeRetrySymbol = Symbol.for('LOG_ERRORS_BEFORE_RETRY');

export interface JestGlobalsOptions {
  config: Config.ProjectConfig;
  globalConfig: Config.GlobalConfig;
  environment: JestEnvironment;
  mockState: MockState;
  moduleMocker: ModuleMocker;
  setMock: (
    from: string,
    moduleName: string,
    mockFactory: () => unknown,
    options?: {virtual?: boolean},
  ) => void;
  setModuleMock: (
    from: string,
    moduleName: string,
    mockFactory: () => Promise<unknown> | unknown,
    options?: {virtual?: boolean},
  ) => void;
  generateMock: <T = unknown>(from: string, moduleName: string) => T;
  requireActual: <T = unknown>(from: string, moduleName: string) => T;
  requireMock: <T = unknown>(from: string, moduleName: string) => T;
  resetModules: () => void;
  isolateModules: (fn: () => void) => void;
  isolateModulesAsync: (fn: () => Promise<void>) => Promise<void>;
  clearAllMocks: () => void;
  resetAllMocks: () => void;
  restoreAllMocks: () => void;
  testState: TestState;
  logFormattedReferenceError: (msg: string) => void;
}

export class JestGlobals {
  private readonly config: Config.ProjectConfig;
  private readonly globalConfig: Config.GlobalConfig;
  private readonly environment: JestEnvironment;
  private readonly mockState: MockState;
  private readonly moduleMocker: ModuleMocker;
  private readonly setMockBridge: JestGlobalsOptions['setMock'];
  private readonly setModuleMockBridge: JestGlobalsOptions['setModuleMock'];
  private readonly generateMock: JestGlobalsOptions['generateMock'];
  private readonly requireActualBridge: JestGlobalsOptions['requireActual'];
  private readonly requireMockBridge: JestGlobalsOptions['requireMock'];
  private readonly resetModulesBridge: () => void;
  private readonly isolateModulesBridge: (fn: () => void) => void;
  private readonly isolateModulesAsyncBridge: (
    fn: () => Promise<void>,
  ) => Promise<void>;
  private readonly clearAllMocksBridge: () => void;
  private readonly resetAllMocksBridge: () => void;
  private readonly restoreAllMocksBridge: () => void;
  private readonly testState: TestState;
  private readonly logFormattedReferenceError: (msg: string) => void;

  private readonly cache = new Map<string, Jest>();
  private fakeTimersImpl: LegacyFakeTimers<unknown> | ModernFakeTimers | null;
  private envGlobalsOverride?: EnvironmentGlobals;
  private cachedEnvGlobals?: EnvironmentGlobals;

  constructor(options: JestGlobalsOptions) {
    this.config = options.config;
    this.globalConfig = options.globalConfig;
    this.environment = options.environment;
    this.mockState = options.mockState;
    this.moduleMocker = options.moduleMocker;
    this.setMockBridge = options.setMock;
    this.setModuleMockBridge = options.setModuleMock;
    this.generateMock = options.generateMock;
    this.requireActualBridge = options.requireActual;
    this.requireMockBridge = options.requireMock;
    this.resetModulesBridge = options.resetModules;
    this.isolateModulesBridge = options.isolateModules;
    this.isolateModulesAsyncBridge = options.isolateModulesAsync;
    this.clearAllMocksBridge = options.clearAllMocks;
    this.resetAllMocksBridge = options.resetAllMocks;
    this.restoreAllMocksBridge = options.restoreAllMocks;
    this.testState = options.testState;
    this.logFormattedReferenceError = options.logFormattedReferenceError;
    this.fakeTimersImpl = this.config.fakeTimers.legacyFakeTimers
      ? this.environment.fakeTimers
      : this.environment.fakeTimersModern;
  }

  jestObjectFor(from: string): Jest {
    const cached = this.cache.get(from);
    if (cached) return cached;
    const fresh = this.buildJestObject(from);
    this.cache.set(from, fresh);
    return fresh;
  }

  envGlobals(): EnvironmentGlobals {
    if (this.envGlobalsOverride) {
      return {...this.envGlobalsOverride};
    }
    let cached = this.cachedEnvGlobals;
    if (cached === undefined) {
      cached = {
        afterAll: this.environment.global.afterAll,
        afterEach: this.environment.global.afterEach,
        beforeAll: this.environment.global.beforeAll,
        beforeEach: this.environment.global.beforeEach,
        describe: this.environment.global.describe,
        expect: this.environment.global.expect as typeof expect,
        fdescribe: this.environment.global.fdescribe,
        fit: this.environment.global.fit,
        it: this.environment.global.it,
        test: this.environment.global.test,
        xdescribe: this.environment.global.xdescribe,
        xit: this.environment.global.xit,
        xtest: this.environment.global.xtest,
      };
      this.cachedEnvGlobals = cached;
    }
    return {...cached};
  }

  cjsGlobals(from: string): JestGlobalsWithJest {
    return {...this.envGlobals(), jest: this.jestObjectFor(from)};
  }

  esmGlobalsModule(from: string, context: VMContext): SyntheticModule {
    return syntheticFromExports(
      '@jest/globals',
      context,
      this.cjsGlobals(from) as unknown as Record<string, unknown>,
    );
  }

  setEnvGlobalsOverride(globals: EnvironmentGlobals): void {
    this.envGlobalsOverride = globals;
  }

  clearJestObjectCache(): void {
    this.cache.clear();
  }

  private buildJestObject(from: string): Jest {
    const disableAutomock = () => {
      this.mockState.disableAutomock();
      return jestObject;
    };
    const enableAutomock = () => {
      this.mockState.enableAutomock();
      return jestObject;
    };
    const unmock = (moduleName: string) => {
        throw new Error("STUB");
    };
    const unmockModule = (moduleName: string) => {
        throw new Error("STUB");
    };
    const deepUnmock = (moduleName: string) => {
      this.mockState.deepUnmock(from, moduleName);
      return jestObject;
    };
    const mock: Jest['mock'] = (moduleName, mockFactory, options) => {
        throw new Error("STUB");
    };
    const onGenerateMock: Jest['onGenerateMock'] = <T>(
      cb: (moduleName: string, moduleMock: T) => T,
    ) => {
        throw new Error("STUB");
    };
    const setMockFactory = (
      moduleName: string,
      mockFactory: () => unknown,
      options?: {virtual?: boolean},
    ) => {
      this.setMockBridge(from, moduleName, mockFactory, options);
      return jestObject;
    };
    const mockModule: Jest['unstable_mockModule'] = (
      moduleName,
      mockFactory,
      options,
    ) => {
        throw new Error("STUB");
    };
    const clearAllMocks = () => {
      this.clearAllMocksBridge();
      return jestObject;
    };
    const resetAllMocks = () => {
      this.resetAllMocksBridge();
      return jestObject;
    };
    const restoreAllMocks = () => {
      this.restoreAllMocksBridge();
      return jestObject;
    };
    const _getFakeTimers = () => {
      if (
        this.testState.isTornDown() ||
        !(this.environment.fakeTimers || this.environment.fakeTimersModern)
      ) {
        this.logFormattedReferenceError(
          'You are trying to access a property or method of the Jest environment after it has been torn down.',
        );
        process.exitCode = 1;
      }
      this.testState.throwIfBetweenTests(
        'You are trying to access a property or method of the Jest environment outside of the scope of the test code.',
      );

      return this.fakeTimersImpl!;
    };
    const useFakeTimers: Jest['useFakeTimers'] = fakeTimersConfig => {
      fakeTimersConfig = {
        ...this.config.fakeTimers,
        ...fakeTimersConfig,
      } as Config.FakeTimersConfig;
      if (fakeTimersConfig?.legacyFakeTimers) {
        this.fakeTimersImpl = this.environment.fakeTimers;
      } else {
        this.fakeTimersImpl = this.environment.fakeTimersModern;
      }
      this.fakeTimersImpl!.useFakeTimers(fakeTimersConfig);
      return jestObject;
    };
    const useRealTimers = () => {
      _getFakeTimers().useRealTimers();
      return jestObject;
    };
    const resetModules = () => {
      this.resetModulesBridge();
      return jestObject;
    };
    const isolateModules = (fn: () => void) => {
        throw new Error("STUB");
    };
    const isolateModulesAsync = this.isolateModulesAsyncBridge;
    const fn = this.moduleMocker.fn.bind(this.moduleMocker);
    const spyOn = this.moduleMocker.spyOn.bind(this.moduleMocker);
    const mocked = this.moduleMocker.mocked.bind(this.moduleMocker);
    const replaceProperty = this.moduleMocker.replaceProperty.bind(
      this.moduleMocker,
    );

    const setTimeout: Jest['setTimeout'] = timeout => {
        throw new Error("STUB");
    };

    const retryTimes: Jest['retryTimes'] = (numTestRetries, options) => {
        throw new Error("STUB");
    };

    const jestObject: Jest = {
      advanceTimersByTime: msToRun =>
        { throw new Error("STUB"); },
      advanceTimersByTimeAsync: async msToRun => {
          throw new Error("STUB");
      },
      advanceTimersToNextFrame: () => {
          throw new Error("STUB");
      },
      advanceTimersToNextTimer: steps =>
        { throw new Error("STUB"); },
      advanceTimersToNextTimerAsync: async steps => {
          throw new Error("STUB");
      },
      autoMockOff: disableAutomock,
      autoMockOn: enableAutomock,
      clearAllMocks,
      clearAllTimers: () => { throw new Error("STUB"); },
      createMockFromModule: moduleName => { throw new Error("STUB"); },
      deepUnmock,
      disableAutomock,
      doMock: mock,
      dontMock: unmock,
      enableAutomock,
      fn,
      getRealSystemTime: () => {
          throw new Error("STUB");
      },
      getSeed: () => { throw new Error("STUB"); },
      getTimerCount: () => { throw new Error("STUB"); },
      isEnvironmentTornDown: () => { throw new Error("STUB"); },
      isMockFunction: this.moduleMocker.isMockFunction,
      isolateModules,
      isolateModulesAsync,
      mock,
      mocked,
      now: () => { throw new Error("STUB"); },
      onGenerateMock,
      replaceProperty,
      requireActual: moduleName => { throw new Error("STUB"); },
      requireMock: moduleName => { throw new Error("STUB"); },
      resetAllMocks,
      resetModules,
      restoreAllMocks,
      retryTimes,
      runAllImmediates: () => {
          throw new Error("STUB");
      },
      runAllTicks: () => { throw new Error("STUB"); },
      runAllTimers: () => { throw new Error("STUB"); },
      runAllTimersAsync: async () => {
          throw new Error("STUB");
      },
      runOnlyPendingTimers: () => { throw new Error("STUB"); },
      runOnlyPendingTimersAsync: async () => {
          throw new Error("STUB");
      },
      setMock: (moduleName, mock) => { throw new Error("STUB"); },
      setSystemTime: now => {
          throw new Error("STUB");
      },
      setTimeout,
      setTimerTickMode: (
        mode:
          | {mode: 'manual' | 'nextAsync'}
          | {mode: 'interval'; delta?: number},
      ) => {
          throw new Error("STUB");
      },
      spyOn,
      unmock,
      unstable_mockModule: mockModule,
      unstable_unmockModule: unmockModule,
      useFakeTimers,
      useRealTimers,
    };
    return jestObject;
  }
}
