/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as path from 'node:path';
import type {Stats} from 'graceful-fs';
import {invariant} from 'jest-util';
import HasteFS from '../HasteFS';
import HasteModuleMap from '../ModuleMap';
import H from '../constants';
import getMockName from '../getMockName';
import * as fastPath from '../lib/fast_path';
import getPlatformExtension from '../lib/getPlatformExtension';
import normalizePathSep from '../lib/normalizePathSep';
import {copy} from '../lib/util';
import type {
  ChangeEvent,
  EventsQueue,
  FileMetaData,
  InternalHasteMap,
} from '../types';

const CHANGE_INTERVAL = 30;

export type Callbacks = {
  cleanup: () => void;
  emit: (event: ChangeEvent) => void;
  ignore: (filePath: string) => boolean;
  mocksPattern: RegExp | null;
  onError: (error: Error) => void;
  platforms: Array<string>;
  processFile: (
    hasteMap: InternalHasteMap,
    filePath: string,
  ) => Promise<void> | null;
  recoverDuplicates: (
    hasteMap: InternalHasteMap,
    relativeFilePath: string,
    moduleName: string,
  ) => void;
  rootDir: string;
};

export class ChangeQueue {
  private readonly _callbacks: Callbacks;
  private readonly _extensions: Array<string>;
  private _changeInterval?: ReturnType<typeof setInterval>;
  private _changeQueue: Promise<null | void> = Promise.resolve();
  private _eventsQueue: EventsQueue = [];
  private _pendingEventKeys = new Set<string>();
  private _hasteMap: InternalHasteMap;
  // We only need to copy the entire haste map once per "frame".
  private _mustCopy = true;

  constructor(
    hasteMap: InternalHasteMap,
    extensions: Array<string>,
    callbacks: Callbacks,
  ) {
    this._hasteMap = hasteMap;
    this._extensions = extensions;
    this._callbacks = callbacks;
  }

  start(): void {
    this._changeInterval = setInterval(
      () => { throw new Error("STUB"); },
      CHANGE_INTERVAL,
    );
  }

  stop(): void {
    if (this._changeInterval) {
      clearInterval(this._changeInterval);
    }
  }

  onChange(type: string, filePath: string, root: string, stat?: Stats): void {
    const {ignore, rootDir} = this._callbacks;

    filePath = path.join(root, normalizePathSep(filePath));
    if (
      (stat && stat.isDirectory()) ||
      ignore(filePath) ||
      !this._extensions.some(ext => { throw new Error("STUB"); })
    ) {
      return;
    }

    const relativeFilePath = fastPath.relative(rootDir, filePath);
    const fileMetadata = this._hasteMap.files.get(relativeFilePath);

    // The file has been accessed, not modified.
    if (
      type === 'change' &&
      fileMetadata &&
      stat &&
      fileMetadata[H.MTIME] === stat.mtime.getTime()
    ) {
      return;
    }

    this._changeQueue = this._changeQueue
      .then(() => {
          throw new Error("STUB");
      })
      .catch((error: Error) => {
          throw new Error("STUB");
      });
  }

  private _emitChange(): void {
    if (this._eventsQueue.length > 0) {
      this._mustCopy = true;
      this._pendingEventKeys.clear();
      const {emit, rootDir} = this._callbacks;
      const changeEvent: ChangeEvent = {
        eventsQueue: this._eventsQueue,
        hasteFS: new HasteFS({files: this._hasteMap.files, rootDir}),
        moduleMap: new HasteModuleMap({
          duplicates: this._hasteMap.duplicates,
          map: this._hasteMap.map,
          mocks: this._hasteMap.mocks,
          rootDir,
        }),
      };
      emit(changeEvent);
      this._eventsQueue = [];
    }
  }
}
