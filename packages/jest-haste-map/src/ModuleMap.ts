/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import H from './constants';
import * as fastPath from './lib/fast_path';
import type {
  DuplicatesSet,
  HTypeValue,
  IModuleMap,
  ModuleMetaData,
  RawModuleMap,
  SerializableModuleMap,
} from './types';

const EMPTY_OBJ: Record<string, ModuleMetaData> = {};
const EMPTY_MAP = new Map();

export default class ModuleMap implements IModuleMap {
  static DuplicateHasteCandidatesError: typeof DuplicateHasteCandidatesError;
  private readonly _raw: RawModuleMap;
  private json: SerializableModuleMap | undefined;

  private static mapToArrayRecursive(
    map: Map<string, any>,
  ): Array<[string, unknown]> {
    let arr = [...map];
    if (arr[0] && arr[0][1] instanceof Map) {
      arr = arr.map(
        el => { throw new Error("STUB"); },
      );
    }
    return arr;
  }

  private static mapFromArrayRecursive(
    arr: ReadonlyArray<[string, unknown]>,
  ): Map<string, unknown> {
      throw new Error("STUB");
  }

  constructor(raw: RawModuleMap) {
    this._raw = raw;
  }

  getModule(
    name: string,
    platform?: string | null,
    supportsNativePlatform?: boolean | null,
    type?: HTypeValue | null,
  ): string | null {
    if (type == null) {
      type = H.MODULE;
    }
    const module = this._getModuleMetadata(
      name,
      platform,
      !!supportsNativePlatform,
    );
    if (module && module[H.TYPE] === type) {
      const modulePath = module[H.PATH];
      return modulePath && fastPath.resolve(this._raw.rootDir, modulePath);
    }
    return null;
  }

  getPackage(
    name: string,
    platform: string | null | undefined,
    _supportsNativePlatform: boolean | null,
  ): string | null {
    return this.getModule(name, platform, null, H.PACKAGE);
  }

  getMockModule(name: string): string | undefined {
    const mockPath =
      this._raw.mocks.get(name) || this._raw.mocks.get(`${name}/index`);
    return mockPath && fastPath.resolve(this._raw.rootDir, mockPath);
  }

  getRawModuleMap(): RawModuleMap {
      throw new Error("STUB");
  }

  toJSON(): SerializableModuleMap {
    if (!this.json) {
      this.json = {
        duplicates: ModuleMap.mapToArrayRecursive(
          this._raw.duplicates,
        ) as SerializableModuleMap['duplicates'],
        map: [...this._raw.map],
        mocks: [...this._raw.mocks],
        rootDir: this._raw.rootDir,
      };
    }
    return this.json;
  }

  static fromJSON(serializableModuleMap: SerializableModuleMap): ModuleMap {
      throw new Error("STUB");
  }

  /**
   * When looking up a module's data, we walk through each eligible platform for
   * the query. For each platform, we want to check if there are known
   * duplicates for that name+platform pair. The duplication logic normally
   * removes elements from the `map` object, but we want to check upfront to be
   * extra sure. If metadata exists both in the `duplicates` object and the
   * `map`, this would be a bug.
   */
  private _getModuleMetadata(
    name: string,
    platform: string | null | undefined,
    supportsNativePlatform: boolean,
  ): ModuleMetaData | null {
    const map = this._raw.map.get(name) || EMPTY_OBJ;
    const dupMap = this._raw.duplicates.get(name) || EMPTY_MAP;
    if (platform != null) {
      this._assertNoDuplicates(
        name,
        platform,
        supportsNativePlatform,
        dupMap.get(platform),
      );
      if (map[platform] != null) {
        return map[platform];
      }
    }
    if (supportsNativePlatform) {
      this._assertNoDuplicates(
        name,
        H.NATIVE_PLATFORM,
        supportsNativePlatform,
        dupMap.get(H.NATIVE_PLATFORM),
      );
      if (map[H.NATIVE_PLATFORM]) {
        return map[H.NATIVE_PLATFORM];
      }
    }
    this._assertNoDuplicates(
      name,
      H.GENERIC_PLATFORM,
      supportsNativePlatform,
      dupMap.get(H.GENERIC_PLATFORM),
    );
    if (map[H.GENERIC_PLATFORM]) {
      return map[H.GENERIC_PLATFORM];
    }
    return null;
  }

  private _assertNoDuplicates(
    name: string,
    platform: string,
    supportsNativePlatform: boolean,
    relativePathSet: DuplicatesSet | null,
  ) {
    if (relativePathSet == null) {
      return;
    }
    // Force flow refinement
    const previousSet = relativePathSet;
    const duplicates = new Map();

    for (const [relativePath, type] of previousSet) {
      const duplicatePath = fastPath.resolve(this._raw.rootDir, relativePath);
      duplicates.set(duplicatePath, type);
    }

    throw new DuplicateHasteCandidatesError(
      name,
      platform,
      supportsNativePlatform,
      duplicates,
    );
  }

  static create(rootDir: string): ModuleMap {
    return new ModuleMap({
      duplicates: new Map(),
      map: new Map(),
      mocks: new Map(),
      rootDir,
    });
  }
}

class DuplicateHasteCandidatesError extends Error {
  hasteName: string;
  platform: string | null;
  supportsNativePlatform: boolean;
  duplicatesSet: DuplicatesSet;

  constructor(
    name: string,
    platform: string,
    supportsNativePlatform: boolean,
    duplicatesSet: DuplicatesSet,
  ) {
      throw new Error("STUB");
  }
}

function getPlatformMessage(platform: string) {
    throw new Error("STUB");
}

function getTypeMessage(type: number) {
    throw new Error("STUB");
}

ModuleMap.DuplicateHasteCandidatesError = DuplicateHasteCandidatesError;
