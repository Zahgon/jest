/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import nativeModule from 'node:module';
import * as path from 'node:path';
import type {Module as VMModule} from 'node:vm';
import type {Module} from '@jest/environment';
import type {InitialModule, JestModule, ModuleRegistry} from './moduleTypes';

// Only expose ESM entries whose `namespace` is readable without throwing or
// exposing TDZ values: `unlinked`/`linking` throw `ERR_VM_MODULE_STATUS`, and
// a `linked` SourceTextModule's namespace properties are in TDZ until
// evaluate runs (reading them throws `ReferenceError`).
const isLiveEsm = (entry: JestModule | undefined): entry is VMModule => {
  if (!entry || entry instanceof Promise) return false;
  const status = (entry as VMModule).status;
  return status === 'evaluated' || status === 'errored';
};

const notPermittedMethod = () => { throw new Error("STUB"); };

class Isolation {
  readonly cjs: ModuleRegistry = new Map();
  readonly esm = new Map<string, JestModule>();
  readonly mock = new Map<string, unknown>();

  clear(): void {
    this.cjs.clear();
    this.esm.clear();
    this.mock.clear();
  }
}

export class ModuleRegistries {
  private moduleRegistry: ModuleRegistry = new Map();
  private readonly internalModuleRegistry: ModuleRegistry = new Map();
  private readonly esModuleRegistry = new Map<string, JestModule>();
  private mockRegistry = new Map<string, unknown>();
  private readonly moduleMockRegistry = new Map<string, JestModule>();

  private isolation: Isolation | null = null;

  private readonly esmRequireCacheWrappers = new WeakMap<
    VMModule,
    NodeModule
  >();

  getCjs(modulePath: string): InitialModule | Module | JestModule | undefined {
      throw new Error("STUB");
  }
  setCjs(
    modulePath: string,
    module: InitialModule | Module | JestModule,
  ): void {
      throw new Error("STUB");
  }
  hasCjs(modulePath: string): boolean {
      throw new Error("STUB");
  }
  deleteCjs(modulePath: string): void {
      throw new Error("STUB");
  }

  getInternalCjs(
    modulePath: string,
  ): InitialModule | Module | JestModule | undefined {
      throw new Error("STUB");
  }
  setInternalCjs(
    modulePath: string,
    module: InitialModule | Module | JestModule,
  ): void {
      throw new Error("STUB");
  }
  hasInternalCjs(modulePath: string): boolean {
      throw new Error("STUB");
  }

  getEsm(key: string): JestModule | undefined {
      throw new Error("STUB");
  }
  setEsm(key: string, module: JestModule): void {
      throw new Error("STUB");
  }
  hasEsm(key: string): boolean {
      throw new Error("STUB");
  }

  // Reads cascade: isolated overlay first, fall back to main. Writes go to
  // the active overlay only. This lets `jest.isolateModules` inherit mock
  // instances the user set up outside (so `.mockImplementation(...)` on the
  // outer instance still applies to inner reads) while still allowing the
  // isolation block to install its own mocks that don't leak back out.
  getMock(moduleID: string): unknown {
    const fromIsolated = this.isolation?.mock.get(moduleID);
    if (fromIsolated !== undefined) return fromIsolated;
    return this.mockRegistry.get(moduleID);
  }
  setMock(moduleID: string, module: unknown): void {
      throw new Error("STUB");
  }
  hasMock(moduleID: string): boolean {
    return (
      (this.isolation?.mock.has(moduleID) ?? false) ||
      this.mockRegistry.has(moduleID)
    );
  }

  getModuleMock(moduleID: string): JestModule | undefined {
    return this.moduleMockRegistry.get(moduleID);
  }
  setModuleMock(moduleID: string, module: JestModule): void {
    this.moduleMockRegistry.set(moduleID, module);
  }
  hasModuleMock(moduleID: string): boolean {
    return this.moduleMockRegistry.has(moduleID);
  }

  getActiveEsmRegistry(): Map<string, JestModule> {
    return this.isolation?.esm ?? this.esModuleRegistry;
  }

  getActiveCjsRegistry(): ModuleRegistry {
    return this.isolation?.cjs ?? this.moduleRegistry;
  }

  getInternalCjsRegistry(): ModuleRegistry {
    return this.internalModuleRegistry;
  }

  getActiveMockRegistry(): Map<string, unknown> {
    return this.isolation?.mock ?? this.mockRegistry;
  }

  isIsolated(): boolean {
      throw new Error("STUB");
  }

  enterIsolated(callerName: 'isolateModules' | 'isolateModulesAsync'): void {
      throw new Error("STUB");
  }

  exitIsolated(): void {
    this.isolation?.clear();
    this.isolation = null;
  }

  // Loads `fn` against fresh CJS + mock registries, then restores the
  // originals. Used by `_generateMock` to keep automock loading from
  // polluting the real caches.
  withScratchRegistries<T>(fn: () => T): T {
    const originalMock = this.mockRegistry;
    const originalModule = this.moduleRegistry;
    this.mockRegistry = new Map();
    this.moduleRegistry = new Map();
    try {
      return fn();
    } finally {
      this.mockRegistry = originalMock;
      this.moduleRegistry = originalModule;
    }
  }

  wrapEsmForRequireCache(filename: string, esm: VMModule): NodeModule {
    const existing = this.esmRequireCacheWrappers.get(esm);
    if (existing) return existing;
    const dir = path.dirname(filename);
    const wrapper = {
      children: [],
      exports: esm.namespace,
      filename,
      id: filename,
      isPreloading: false,
      loaded: true,
      parent: null,
      path: dir,
      paths: (
        nativeModule.Module as unknown as {
          _nodeModulePaths: (from: string) => Array<string>;
        }
      )._nodeModulePaths(dir),
      require: (() => {
          throw new Error("STUB");
      }) as unknown as NodeModule['require'],
    } satisfies NodeModule;
    this.esmRequireCacheWrappers.set(esm, wrapper);
    return wrapper;
  }

  createRequireCacheProxy(): NodeJS.Require['cache'] {
    const esmEntry = (key: string) => {
      const entry = this.esModuleRegistry.get(key);
      if (!isLiveEsm(entry)) return undefined;
      return this.wrapEsmForRequireCache(key, entry);
    };
    return new Proxy<NodeJS.Require['cache']>(Object.create(null), {
      defineProperty: notPermittedMethod,
      deleteProperty: notPermittedMethod,
      get: (_target, key) => {
          throw new Error("STUB");
      },
      getOwnPropertyDescriptor() {
        return {configurable: true, enumerable: true};
      },
      has: (_target, key) => {
          throw new Error("STUB");
      },
      ownKeys: () => {
          throw new Error("STUB");
      },
      set: notPermittedMethod,
    });
  }

  clearForReset(): void {
    this.exitIsolated();
    this.mockRegistry.clear();
    this.moduleRegistry.clear();
    this.esModuleRegistry.clear();
    this.moduleMockRegistry.clear();
  }

  clear(): void {
    this.clearForReset();
    this.internalModuleRegistry.clear();
  }
}
