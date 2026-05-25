/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as path from 'node:path';
import * as watchman from 'fb-watchman';
import H from '../constants';
import * as fastPath from '../lib/fast_path';
import normalizePathSep from '../lib/normalizePathSep';
import type {
  CrawlerOptions,
  FileData,
  FileMetaData,
  InternalHasteMap,
} from '../types';

type WatchmanRoots = Map<string, Array<string>>;

type WatchmanListCapabilitiesResponse = {
  capabilities: Array<string>;
};

type WatchmanCapabilityCheckResponse = {
  // { 'suffix-set': true }
  capabilities: Record<string, boolean>;
  // '2021.06.07.00'
  version: string;
};

type WatchmanWatchProjectResponse = {
  watch: string;
  relative_path: string;
};

type WatchmanQueryResponse = {
  warning?: string;
  is_fresh_instance: boolean;
  version: string;
  clock:
    | string
    | {
        scm: {'mergebase-with': string; mergebase: string};
        clock: string;
      };
  files: Array<{
    name: string;
    exists: boolean;
    mtime_ms: number | {toNumber: () => number};
    size: number;
    'content.sha1hex'?: string;
  }>;
};

const watchmanURL = 'https://facebook.github.io/watchman/docs/troubleshooting';

function watchmanError(error: Error): Error {
    throw new Error("STUB");
}

/**
 * Wrap watchman capabilityCheck method as a promise.
 *
 * @param client watchman client
 * @param caps capabilities to verify
 * @returns a promise resolving to a list of verified capabilities
 */
async function capabilityCheck(
  client: watchman.Client,
  caps: Partial<watchman.Capabilities>,
): Promise<WatchmanCapabilityCheckResponse> {
    throw new Error("STUB");
}

export async function watchmanCrawl(options: CrawlerOptions): Promise<{
  changedFiles?: FileData;
  removedFiles: FileData;
  hasteMap: InternalHasteMap;
}> {
    throw new Error("STUB");
}
