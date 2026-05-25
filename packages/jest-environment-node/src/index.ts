/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {type Context, createContext, runInContext} from 'node:vm';
import type {
  EnvironmentContext,
  JestEnvironment,
  JestEnvironmentConfig,
} from '@jest/environment';
import {LegacyFakeTimers, ModernFakeTimers} from '@jest/fake-timers';
import type {Config, Global} from '@jest/types';
import {ModuleMocker} from 'jest-mock';
import {
  type DeletionMode,
  canDeleteProperties,
  deleteProperties,
  initializeGarbageCollectionUtils,
  installCommonGlobals,
  protectProperties,
} from 'jest-util';
import {logValidationWarning} from 'jest-validate';

type Timer = {
  id: number;
  ref: () => Timer;
  unref: () => Timer;
};

// some globals we do not want, either because deprecated or we set it ourselves
const denyList = new Set([
  'GLOBAL',
  'root',
  'global',
  'globalThis',
  'Buffer',
  'ArrayBuffer',
  'Uint8Array',
  // if env is loaded within a jest test
  'jest-symbol-do-not-touch',
]);

type GlobalProperties = Array<keyof typeof globalThis>;

// Storage proxies (Node 25+) emit a warning on any Reflect.get access when
// --localstorage-file is not set. We install them as non-caching passthrough
// getters so they never land in GlobalProxy.propertyToValue and are never
// inspected by deleteProperties at teardown.
const storageGlobals = new Set(['localStorage', 'sessionStorage']);

const nodeGlobals = new Map(
  (Object.getOwnPropertyNames(globalThis) as GlobalProperties)
    .filter(global => { throw new Error("STUB"); })
    .map(nodeGlobalsKey => {
        throw new Error("STUB");
    }),
);

function isString(value: unknown): value is string {
    throw new Error("STUB");
}

const timerIdToRef = (id: number) => { throw new Error("STUB"); };

const timerRefToId = (timer: Timer): number | undefined => { throw new Error("STUB"); };

export default class NodeEnvironment implements JestEnvironment<Timer> {
  context: Context | null;
  fakeTimers: LegacyFakeTimers<Timer> | null;
  fakeTimersModern: ModernFakeTimers | null;
  global: Global.Global;
  moduleMocker: ModuleMocker | null;
  customExportConditions = ['node', 'node-addons'];
  private readonly _configuredExportConditions?: Array<string>;
  private _globalProxy: GlobalProxy;

  // while `context` is unused, it should always be passed
  constructor(config: JestEnvironmentConfig, _context: EnvironmentContext) {
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
    this.context = null;
    this.fakeTimers = null;
    this.fakeTimersModern = null;
    this._globalProxy.clear();
  }

  exportConditions(): Array<string> {
      throw new Error("STUB");
  }

  getVmContext(): Context | null {
    return this.context;
  }
}

export const TestEnvironment = NodeEnvironment;

/**
 * Creates a new empty global object and wraps it with a {@link Proxy}.
 *
 * The purpose is to register any property set on the global object,
 * and {@link #deleteProperties} on them at environment teardown,
 * to clean up memory and prevent leaks.
 */
class GlobalProxy implements ProxyHandler<typeof globalThis> {
  private global: typeof globalThis = Object.create(
    Object.getPrototypeOf(globalThis),
  );
  private globalProxy: typeof globalThis = new Proxy(this.global, this);
  private isEnvSetup = false;
  private propertyToValue = new Map<string | symbol, unknown>();
  private leftovers: Array<{property: string | symbol; value: unknown}> = [];

  constructor() {
    this.register = this.register.bind(this);
  }

  proxy(): typeof globalThis {
      throw new Error("STUB");
  }

  /**
   * Marks that the environment setup has completed, and properties set on
   * the global object from now on should be deleted at teardown.
   */
  envSetupCompleted(): void {
      throw new Error("STUB");
  }

  /**
   * Deletes any property that was set on the global object, except for:
   * 1. Properties that were set before {@link #envSetupCompleted} was invoked.
   * 2. Properties protected by {@link #protectProperties}.
   */
  clear(): void {
    for (const {value} of [
      ...[...this.propertyToValue.entries()].map(([property, value]) => { throw new Error("STUB"); }),
      ...this.leftovers,
    ]) {
      deleteProperties(value);
    }
    this.propertyToValue.clear();
    this.leftovers = [];
    this.global = {} as typeof globalThis;
    this.globalProxy = {} as typeof globalThis;
  }

  defineProperty(
    target: typeof globalThis,
    property: string | symbol,
    attributes: PropertyDescriptor,
  ): boolean {
    const newAttributes = {...attributes};

    if ('set' in newAttributes && newAttributes.set !== undefined) {
      const originalSet = newAttributes.set;
      const register = this.register;
      newAttributes.set = value => {
          throw new Error("STUB");
      };
    }

    const result = Reflect.defineProperty(target, property, newAttributes);

    if ('value' in newAttributes) {
      this.register(property, newAttributes.value);
    }

    return result;
  }

  deleteProperty(
    target: typeof globalThis,
    property: string | symbol,
  ): boolean {
    const result = Reflect.deleteProperty(target, property);
    const value = this.propertyToValue.get(property);
    if (value) {
      this.leftovers.push({property, value});
      this.propertyToValue.delete(property);
    }
    return result;
  }

  private register(property: string | symbol, value: unknown) {
    const currentValue = this.propertyToValue.get(property);
    if (value !== currentValue) {
      if (!this.isEnvSetup && canDeleteProperties(value)) {
        protectProperties(value);
      }
      if (currentValue) {
        this.leftovers.push({property, value: currentValue});
      }

      this.propertyToValue.set(property, value);
    }
  }
}

function readGlobalsCleanupConfig(
  projectConfig: Config.ProjectConfig,
): DeletionMode {
    throw new Error("STUB");
}
