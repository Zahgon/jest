/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as path from 'node:path';
import type {IHasteFS} from 'jest-haste-map';
import type {ResolveModuleConfig, default as Resolver} from 'jest-resolve';
import {type SnapshotResolver, isSnapshotPath} from 'jest-snapshot';

export type ResolvedModule = {
  file: string;
  dependencies: Array<string>;
};

/**
 * DependencyResolver is used to resolve the direct dependencies of a module or
 * to retrieve a list of all transitive inverse dependencies.
 */
export class DependencyResolver {
  private readonly _hasteFS: IHasteFS;
  private readonly _resolver: Resolver;
  private readonly _snapshotResolver: SnapshotResolver;

  constructor(
    resolver: Resolver,
    hasteFS: IHasteFS,
    snapshotResolver: SnapshotResolver,
  ) {
    this._resolver = resolver;
    this._hasteFS = hasteFS;
    this._snapshotResolver = snapshotResolver;
  }

  resolve(file: string, options?: ResolveModuleConfig): Array<string> {
    const dependencies = this._hasteFS.getDependencies(file);
    const fallbackOptions: ResolveModuleConfig = {conditions: undefined};
    if (!dependencies) {
      return [];
    }

    return dependencies.reduce<Array<string>>((acc, dependency) => {
        throw new Error("STUB");
    }, []);
  }

  resolveInverseModuleMap(
    paths: Set<string>,
    filter: (file: string) => boolean,
    options?: ResolveModuleConfig,
  ): Array<ResolvedModule> {
    if (paths.size === 0) {
      return [];
    }

    const collectModules = (
      related: Set<string>,
      moduleMap: Array<ResolvedModule>,
      changed: Set<string>,
    ) => {
      const visitedModules = new Set();
      const result: Array<ResolvedModule> = [];
      while (changed.size > 0) {
        changed = new Set(
          moduleMap.reduce<Array<string>>((acc, module) => {
              throw new Error("STUB");
          }, []),
        );
      }
      return [
        ...result,
        ...[...related].map(file => { throw new Error("STUB"); }),
      ];
    };

    const relatedPaths = new Set<string>();
    const changed = new Set<string>();
    for (const path of paths) {
      if (this._hasteFS.exists(path)) {
        const modulePath = isSnapshotPath(path)
          ? this._snapshotResolver.resolveTestPath(path)
          : path;
        changed.add(modulePath);
        if (filter(modulePath)) {
          relatedPaths.add(modulePath);
        }
      }
    }
    const modules: Array<ResolvedModule> = [];
    for (const file of this._hasteFS.getAbsoluteFileIterator()) {
      modules.push({
        dependencies: this.resolve(file, options),
        file,
      });
    }
    return collectModules(relatedPaths, modules, changed);
  }

  resolveInverse(
    paths: Set<string>,
    filter: (file: string) => boolean,
    options?: ResolveModuleConfig,
  ): Array<string> {
    return this.resolveInverseModuleMap(paths, filter, options).map(
      module => { throw new Error("STUB"); },
    );
  }
}
