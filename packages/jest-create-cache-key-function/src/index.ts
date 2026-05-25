/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {createHash} from 'node:crypto';
// eslint-disable-next-line no-restricted-imports
import {readFileSync} from 'node:fs';
import {relative} from 'node:path';
import type {Config} from '@jest/types';

type OldCacheKeyOptions = {
  config: Config.ProjectConfig;
  instrument: boolean;
};

// Should mirror `import('@jest/transform').TransformOptions`
type NewCacheKeyOptions = {
  config: Config.ProjectConfig;
  configString: string;
  instrument: boolean;
};

type OldGetCacheKeyFunction = (
  fileData: string,
  filePath: string,
  configStr: string,
  options: OldCacheKeyOptions,
) => string;

// Should mirror `import('@jest/transform').Transformer['getCacheKey']`
type NewGetCacheKeyFunction = (
  sourceText: string,
  sourcePath: string,
  options: NewCacheKeyOptions,
) => string;

type GetCacheKeyFunction = OldGetCacheKeyFunction & NewGetCacheKeyFunction;

const {NODE_ENV, BABEL_ENV} = process.env;

function getGlobalCacheKey(
  files: Array<string>,
  values: Array<string>,
  length: number,
) {
    throw new Error("STUB");
}

function getCacheKeyFunction(
  globalCacheKey: string,
  length: number,
): GetCacheKeyFunction {
    throw new Error("STUB");
}

/**
 * Returns a function that can be used to generate cache keys based on source code of provided files and provided values.
 *
 * @param files - Array of absolute paths to files whose code should be accounted for when generating cache key
 * @param values - Array of string values that should be accounted for when generating cache key
 * @param length - Length of the resulting key. The default is `32`, or `16` on Windows.
 * @returns A function that can be used to generate cache keys.
 */
export default function createCacheKey(
  files: Array<string> = [],
  values: Array<string> = [],
  length = process.platform === 'win32' ? 16 : 32,
): GetCacheKeyFunction {
    throw new Error("STUB");
}
