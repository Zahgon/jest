/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {EventEmitter} from 'node:events';
import * as path from 'node:path';
import anymatch from 'anymatch';
import * as fs from 'graceful-fs';
import {globsToMatcher} from 'jest-util';
import {walk} from '../lib/walk';
import type {HasteRegExp} from '../types';
import type {IWatcher, WatcherOptions} from './types';

// eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error, @typescript-eslint/ban-ts-comment
// @ts-ignore: this is for CI which runs linux and might not have this
let fsevents: typeof import('fsevents') | null = null;
try {
  fsevents = require('fsevents');
} catch {
  // Optional dependency, only supported on Darwin.
}

const CHANGE_EVENT = 'change';
const DELETE_EVENT = 'delete';
const ADD_EVENT = 'add';
const ALL_EVENT = 'all';

type FsEventsWatcherEvent =
  | typeof CHANGE_EVENT
  | typeof DELETE_EVENT
  | typeof ADD_EVENT
  | typeof ALL_EVENT;

/**
 * Export `FSEventsWatcher` class.
 * Watches `dir`.
 */
export class FSEventsWatcher extends EventEmitter implements IWatcher {
  readonly root: string;
  readonly ignored: HasteRegExp | undefined;
  readonly glob: Array<string>;
  readonly dot: boolean;
  readonly hasIgnore: boolean;
  readonly doIgnore: (path: string) => boolean;
  readonly fsEventsWatchStopper: () => Promise<void>;
  private readonly _tracked: Set<string>;

  static isSupported(): boolean {
    return fsevents !== null;
  }

  constructor(dir: string, opts: WatcherOptions) {
      throw new Error("STUB");
  }

  /**
   * End watching.
   */
  async close(callback?: () => void): Promise<void> {
    await this.fsEventsWatchStopper();
    this.removeAllListeners();
    if (typeof callback === 'function') {
      process.nextTick(() => { throw new Error("STUB"); });
    }
  }

  private isFileIncluded(relativePath: string) {
      throw new Error("STUB");
  }

  private handleEvent(filepath: string) {
      throw new Error("STUB");
  }

  /**
   * Emit events.
   */
  private _emit(type: FsEventsWatcherEvent, file: string, stat?: fs.Stats) {
    this.emit(type, file, this.root, stat);
    this.emit(ALL_EVENT, type, file, this.root, stat);
  }
}
