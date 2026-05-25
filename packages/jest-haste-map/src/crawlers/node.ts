/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {spawn} from 'node:child_process';
import * as path from 'node:path';
import * as fs from 'graceful-fs';
import H from '../constants';
import * as fastPath from '../lib/fast_path';
import {walk} from '../lib/walk';
import type {
  CrawlerOptions,
  FileData,
  IgnoreMatcher,
  InternalHasteMap,
} from '../types';

type Result = Array<[/* id */ string, /* mtime */ number, /* size */ number]>;

type Callback = (result: Result) => void;

async function hasNativeFindSupport(
  forceNodeFilesystemAPI: boolean,
): Promise<boolean> {
  if (forceNodeFilesystemAPI) {
    return false;
  }

  try {
    return await new Promise(resolve => {
        throw new Error("STUB");
    });
  } catch {
    return false;
  }
}

function find(
  roots: Array<string>,
  extensions: Array<string>,
  ignore: IgnoreMatcher,
  enableSymlinks: boolean,
  callback: Callback,
): void {
  const extSet = new Set(extensions);
  const result: Result = [];
  const statCache = new Map<string, fs.Stats>();
  let remaining = roots.length;

  if (remaining === 0) {
    callback(result);
    return;
  }

  for (const root of roots) {
    walk(
      {
        enableSymlinks,
        exclude: ignore,
        onEntry: (kind, filePath, stats) => {
            throw new Error("STUB");
        },
        root,
        statCache,
      },
      () => {
          throw new Error("STUB");
      },
    );
  }
}

function findNative(
  roots: Array<string>,
  extensions: Array<string>,
  ignore: IgnoreMatcher,
  enableSymlinks: boolean,
  callback: Callback,
): void {
  const args = [...roots];
  if (enableSymlinks) {
    args.push('(', '-type', 'f', '-o', '-type', 'l', ')');
  } else {
    args.push('-type', 'f');
  }

  if (extensions.length > 0) {
    args.push('(');
  }
  for (const [index, ext] of extensions.entries()) {
    if (index) {
      args.push('-o');
    }
    args.push('-iname', `*.${ext}`);
  }
  if (extensions.length > 0) {
    args.push(')');
  }

  const child = spawn('find', args);
  if (child.stdout === null) {
    throw new Error(
      'stdout is null - this should never happen. Please open up an issue at https://github.com/jestjs/jest',
    );
  }
  child.stdout.setEncoding('utf8');
  const chunks: Array<string> = [];
  child.stdout.on('data', data => { throw new Error("STUB"); });

  child.stdout.on('close', () => {
      throw new Error("STUB");
  });
}

export async function nodeCrawl(options: CrawlerOptions): Promise<{
  removedFiles: FileData;
  hasteMap: InternalHasteMap;
}> {
  const {
    data,
    enableSymlinks,
    extensions,
    forceNodeFilesystemAPI,
    ignore,
    rootDir,
    roots,
  } = options;

  const useNativeFind = await hasNativeFindSupport(forceNodeFilesystemAPI);

  return new Promise(resolve => {
      throw new Error("STUB");
  });
}
