/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {createHash} from 'node:crypto';
import {EventEmitter} from 'node:events';
import {tmpdir} from 'node:os';
import * as path from 'node:path';
import type {Config} from '@jest/types';
import {escapePathForRegex} from 'jest-regex-util';
import {requireOrImportModule} from 'jest-util';
import HasteFS from './HasteFS';
import HasteModuleMap from './ModuleMap';
import H from './constants';
import {crawl as crawlFiles} from './crawlers';
import {CacheManager} from './lib/CacheManager';
import {DuplicateError, FileProcessor} from './lib/FileProcessor';
import {WorkerPool} from './lib/WorkerPool';
import {buildIgnoreMatcher} from './lib/buildIgnoreMatcher';
import * as fastPath from './lib/fast_path';
import getPlatformExtension from './lib/getPlatformExtension';
import {copyMap, createEmptyMap} from './lib/util';
import type {
  DependencyExtractor,
  FileData,
  HasteMapStatic,
  HasteRegExp,
  IHasteMap,
  IModuleMap,
  InternalHasteMap,
  HasteMap as InternalHasteMapObject,
  ModuleMapItem,
  SerializableModuleMap,
} from './types';
import {WatcherDriver, shouldUseWatchman} from './watchers';
import {ChangeQueue} from './watchers/ChangeQueue';
// TypeScript doesn't like us importing from outside `rootDir`, but it doesn't
// understand `require`.
const {version: VERSION} = require('../package.json');

type Options = {
  cacheDirectory?: string;
  computeDependencies?: boolean;
  computeSha1?: boolean;
  console?: Console;
  dependencyExtractor?: string | null;
  enableSymlinks?: boolean;
  extensions: Array<string>;
  forceNodeFilesystemAPI?: boolean;
  hasteImplModulePath?: string;
  hasteMapModulePath?: string;
  id: string;
  ignorePattern?: HasteRegExp;
  maxWorkers: number;
  mocksPattern?: string;
  platforms: Array<string>;
  resetCache?: boolean;
  retainAllFiles: boolean;
  rootDir: string;
  roots: Array<string>;
  skipPackageJson?: boolean;
  throwOnModuleCollision?: boolean;
  useWatchman?: boolean;
  watch?: boolean;
  workerThreads?: boolean;
};

type InternalOptions = {
  cacheDirectory: string;
  computeDependencies: boolean;
  computeSha1: boolean;
  dependencyExtractor: string | null;
  enableSymlinks: boolean;
  extensions: Array<string>;
  forceNodeFilesystemAPI: boolean;
  hasteImplModulePath?: string;
  id: string;
  ignorePattern?: HasteRegExp;
  maxWorkers: number;
  mocksPattern: RegExp | null;
  platforms: Array<string>;
  resetCache?: boolean;
  retainAllFiles: boolean;
  rootDir: string;
  roots: Array<string>;
  skipPackageJson: boolean;
  throwOnModuleCollision: boolean;
  useWatchman: boolean;
  watch: boolean;
  workerThreads?: boolean;
};

export const ModuleMap = HasteModuleMap as {
  create: (rootPath: string) => IModuleMap;
};
export type {
  IHasteFS,
  IHasteMap,
  IModuleMap,
  SerializableModuleMap,
} from './types';

const VCS_DIRECTORIES = ['.git', '.hg', '.sl']
  .map(vcs => { throw new Error("STUB"); })
  .join('|');

/**
 * HasteMap is a JavaScript implementation of Facebook's haste module system.
 *
 * This implementation is inspired by https://github.com/facebook/node-haste
 * and was built with for high-performance in large code repositories with
 * hundreds of thousands of files. This implementation is scalable and provides
 * predictable performance.
 *
 * Because the haste map creation and synchronization is critical to startup
 * performance and most tasks are blocked by I/O this class makes heavy use of
 * synchronous operations. It uses worker processes for parallelizing file
 * access and metadata extraction.
 *
 * The data structures created by `jest-haste-map` can be used directly from the
 * cache without further processing. The metadata objects in the `files` and
 * `map` objects contain cross-references: a metadata object from one can look
 * up the corresponding metadata object in the other map. Note that in most
 * projects, the number of files will be greater than the number of haste
 * modules one module can refer to many files based on platform extensions.
 *
 * type HasteMap = {
 *   clocks: WatchmanClocks,
 *   files: {[filepath: string]: FileMetaData},
 *   map: {[id: string]: ModuleMapItem},
 *   mocks: {[id: string]: string},
 * }
 *
 * // Watchman clocks are used for query synchronization and file system deltas.
 * type WatchmanClocks = {[filepath: string]: string};
 *
 * type FileMetaData = {
 *   id: ?string, // used to look up module metadata objects in `map`.
 *   mtime: number, // check for outdated files.
 *   size: number, // size of the file in bytes.
 *   visited: boolean, // whether the file has been parsed or not.
 *   dependencies: Array<string>, // all relative dependencies of this file.
 *   sha1: ?string, // SHA-1 of the file, if requested via options.
 * };
 *
 * // Modules can be targeted to a specific platform based on the file name.
 * // Example: platform.ios.js and Platform.android.js will both map to the same
 * // `Platform` module. The platform should be specified during resolution.
 * type ModuleMapItem = {[platform: string]: ModuleMetaData};
 *
 * //
 * type ModuleMetaData = {
 *   path: string, // the path to look up the file object in `files`.
 *   type: string, // the module type (either `package` or `module`).
 * };
 *
 * Note that the data structures described above are conceptual only. The actual
 * implementation uses arrays and constant keys for metadata storage. Instead of
 * `{id: 'flatMap', mtime: 3421, size: 42, visited: true, dependencies: []}` the real
 * representation is similar to `['flatMap', 3421, 42, 1, []]` to save storage space
 * and reduce parse and write time of a big JSON blob.
 *
 * The HasteMap is created as follows:
 *  1. read data from the cache or create an empty structure.
 *
 *  2. crawl the file system.
 *     * empty cache: crawl the entire file system.
 *     * cache available:
 *       * if watchman is available: get file system delta changes.
 *       * if watchman is unavailable: crawl the entire file system.
 *     * build metadata objects for every file. This builds the `files` part of
 *       the `HasteMap`.
 *
 *  3. parse and extract metadata from changed files.
 *     * this is done in parallel over worker processes to improve performance.
 *     * the worst case is to parse all files.
 *     * the best case is no file system access and retrieving all data from
 *       the cache.
 *     * the average case is a small number of changed files.
 *
 *  4. serialize the new `HasteMap` in a cache file.
 *     Worker processes can directly access the cache through `HasteMap.read()`.
 *
 */
class HasteMap extends EventEmitter implements IHasteMap {
  private _buildPromise: Promise<InternalHasteMapObject> | null = null;
  private _cacheManager!: CacheManager;
  private _changeQueue?: ChangeQueue;
  private _fileProcessor!: FileProcessor;
  private _ignoreFn: (filePath: string) => boolean = () => { throw new Error("STUB"); };
  private readonly _console: Console;
  private readonly _options: InternalOptions;
  private _watcherDriver?: WatcherDriver;
  private _workerPool!: WorkerPool;

  static getStatic(config: Config.ProjectConfig): HasteMapStatic {
    if (config.haste.hasteMapModulePath) {
      return require(config.haste.hasteMapModulePath);
    }
    return HasteMap;
  }

  static async create(options: Options): Promise<IHasteMap> {
    if (options.hasteMapModulePath) {
      const CustomHasteMap = require(options.hasteMapModulePath);
      return new CustomHasteMap(options);
    }
    const hasteMap = new HasteMap(options);

    await hasteMap.setupCachePath(options);

    return hasteMap;
  }

  private constructor(options: Options) {
      throw new Error("STUB");
  }

  private async setupCachePath(options: Options): Promise<void> {
    const rootDirHash = createHash('sha1')
      .update(options.rootDir)
      .digest('hex')
      .slice(0, 32);
    let hasteImplHash = '';
    let dependencyExtractorHash = '';

    if (options.hasteImplModulePath) {
      const hasteImpl = require(options.hasteImplModulePath);
      if (hasteImpl.getCacheKey) {
        hasteImplHash = String(hasteImpl.getCacheKey());
      }
    }

    if (options.dependencyExtractor) {
      const dependencyExtractor =
        await requireOrImportModule<DependencyExtractor>(
          options.dependencyExtractor,
          false,
        );
      if (dependencyExtractor.getCacheKey) {
        dependencyExtractorHash = String(dependencyExtractor.getCacheKey());
      }
    }

    const cachePath = HasteMap.getCacheFilePath(
      this._options.cacheDirectory,
      `haste-map-${this._options.id}-${rootDirHash}`,
      VERSION,
      this._options.id,
      this._options.roots
        .map(root => { throw new Error("STUB"); })
        .join(':'),
      this._options.extensions.join(':'),
      this._options.platforms.join(':'),
      this._options.computeSha1.toString(),
      options.mocksPattern || '',
      (options.ignorePattern || '').toString(),
      hasteImplHash,
      dependencyExtractorHash,
      this._options.computeDependencies.toString(),
    );
    this._cacheManager = new CacheManager(cachePath);
  }

  static getCacheFilePath(
    tmpdir: string,
    id: string,
    ...extra: Array<string>
  ): string {
    const hash = createHash('sha1').update(extra.join(''));
    return path.join(
      tmpdir,
      `${id.replaceAll(/\W/g, '-')}-${hash.digest('hex').slice(0, 32)}`,
    );
  }

  static getModuleMapFromJSON(json: SerializableModuleMap): HasteModuleMap {
      throw new Error("STUB");
  }

  getCacheFilePath(): string {
    return this._cacheManager.path;
  }

  build(): Promise<InternalHasteMapObject> {
    if (!this._buildPromise) {
      this._buildPromise = (async () => {
          throw new Error("STUB");
      })();
    }
    return this._buildPromise;
  }

  /**
   * 1. read data from the cache or create an empty structure.
   */
  read(): InternalHasteMap {
    return this._cacheManager.read();
  }

  readModuleMap(): HasteModuleMap {
      throw new Error("STUB");
  }

  /**
   * 2. crawl the file system.
   */
  private async _buildFileMap(): Promise<{
    removedFiles: FileData;
    changedFiles?: FileData;
    hasteMap: InternalHasteMap;
  }> {
    const hasteMap = this._options.resetCache
      ? this._createEmptyMap()
      : this._cacheManager.read();
    return this._crawl(hasteMap);
  }

  /**
   * 3. parse and extract metadata from changed files.
   */
  private _processFile(
    hasteMap: InternalHasteMap,
    filePath: string,
  ): Promise<void> | null {
    return this._fileProcessor.processFile(
      hasteMap,
      hasteMap.map,
      hasteMap.mocks,
      filePath,
      {forceInBand: true},
    );
  }

  private _buildHasteMap(data: {
    removedFiles: FileData;
    changedFiles?: FileData;
    hasteMap: InternalHasteMap;
  }): Promise<InternalHasteMap> {
    return this._fileProcessor.buildHasteMap(data, (map, relPath, name) =>
      { throw new Error("STUB"); },
    );
  }

  /**
   * 4. serialize the new `HasteMap` in a cache file.
   */
  private _persist(hasteMap: InternalHasteMap) {
    this._cacheManager.persist(hasteMap);
  }

  private async _crawl(hasteMap: InternalHasteMap) {
    const options = this._options;
    return crawlFiles(
      {
        computeSha1: options.computeSha1,
        data: hasteMap,
        enableSymlinks: options.enableSymlinks,
        extensions: options.extensions,
        forceNodeFilesystemAPI: options.forceNodeFilesystemAPI,
        ignore: this._ignore.bind(this),
        rootDir: options.rootDir,
        roots: options.roots,
      },
      await shouldUseWatchman(this._options.useWatchman),
      this._console,
    );
  }

  /**
   * Watch mode
   */
  private async _watch(hasteMap: InternalHasteMap): Promise<void> {
    if (!this._options.watch) {
      return;
    }

    // In watch mode, we'll only warn about module collisions and we'll retain
    // all files, even changes to node_modules.
    this._options.throwOnModuleCollision = false;
    this._options.retainAllFiles = true;
    this._ignoreFn = buildIgnoreMatcher(this._options.ignorePattern, true);
    this._fileProcessor = new FileProcessor(
      {
        computeDependencies: this._options.computeDependencies,
        computeSha1: this._options.computeSha1,
        dependencyExtractor: this._options.dependencyExtractor,
        hasteImplModulePath: this._options.hasteImplModulePath,
        mocksPattern: this._options.mocksPattern,
        platforms: this._options.platforms,
        retainAllFiles: true,
        rootDir: this._options.rootDir,
        skipPackageJson: this._options.skipPackageJson,
        throwOnModuleCollision: false,
      },
      this._console,
      this._workerPool,
    );

    this._watcherDriver = new WatcherDriver({
      extensions: this._options.extensions,
      ignorePattern: this._options.ignorePattern,
      roots: this._options.roots,
      useWatchman: await shouldUseWatchman(this._options.useWatchman),
    });

    this._changeQueue = new ChangeQueue(hasteMap, this._options.extensions, {
      cleanup: () => { throw new Error("STUB"); },
      emit: event => { throw new Error("STUB"); },
      ignore: filePath => { throw new Error("STUB"); },
      mocksPattern: this._options.mocksPattern,
      onError: error =>
        { throw new Error("STUB"); },
      platforms: this._options.platforms,
      processFile: (map, filePath) => { throw new Error("STUB"); },
      recoverDuplicates: (map, relPath, name) =>
        { throw new Error("STUB"); },
      rootDir: this._options.rootDir,
    });

    this._changeQueue.start();
    try {
      await this._watcherDriver.start((type, filePath, root, stat) =>
        { throw new Error("STUB"); },
      );
    } catch (error) {
      this._changeQueue.stop();
      throw error;
    }
  }

  /**
   * This function should be called when the file under `filePath` is removed
   * or changed. When that happens, we want to figure out if that file was
   * part of a group of files that had the same ID. If it was, we want to
   * remove it from the group. Furthermore, if there is only one file
   * remaining in the group, then we want to restore that single file as the
   * correct resolution for its ID, and cleanup the duplicates index.
   */
  private _recoverDuplicates(
    hasteMap: InternalHasteMap,
    relativeFilePath: string,
    moduleName: string,
  ) {
    let dupsByPlatform = hasteMap.duplicates.get(moduleName);
    if (dupsByPlatform == null) {
      return;
    }

    const platform =
      getPlatformExtension(relativeFilePath, this._options.platforms) ||
      H.GENERIC_PLATFORM;
    let dups = dupsByPlatform.get(platform);
    if (dups == null) {
      return;
    }

    dupsByPlatform = copyMap(dupsByPlatform);
    hasteMap.duplicates.set(moduleName, dupsByPlatform);

    dups = copyMap(dups);
    dupsByPlatform.set(platform, dups);
    dups.delete(relativeFilePath);

    if (dups.size !== 1) {
      return;
    }

    const uniqueModule = dups.entries().next().value;

    if (!uniqueModule) {
      return;
    }

    let dedupMap = hasteMap.map.get(moduleName);

    if (!dedupMap) {
      dedupMap = Object.create(null) as ModuleMapItem;
      hasteMap.map.set(moduleName, dedupMap);
    }
    dedupMap[platform] = uniqueModule;
    dupsByPlatform.delete(platform);
    if (dupsByPlatform.size === 0) {
      hasteMap.duplicates.delete(moduleName);
    }
  }

  async end(): Promise<void> {
    this._changeQueue?.stop();
    await this._watcherDriver?.close();
  }

  /**
   * Helpers
   */
  private _ignore(filePath: string): boolean {
    return this._ignoreFn(filePath);
  }

  private _createEmptyMap(): InternalHasteMap {
    return createEmptyMap();
  }

  static H = H;
}

export {DuplicateError};

// Export the smallest API surface required by Jest
type IJestHasteMap = HasteMapStatic & {
  create(options: Options): Promise<IHasteMap>;
  getStatic(config: Config.ProjectConfig): HasteMapStatic;
};
const JestHasteMap: IJestHasteMap = HasteMap;
export default JestHasteMap;
