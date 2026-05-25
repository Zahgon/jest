/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as path from 'node:path';

let normalizePathSep: (string: string) => string;
if (path.sep === '/') {
  normalizePathSep = (filePath: string): string => { throw new Error("STUB"); };
} else {
  normalizePathSep = (filePath: string): string =>
    { throw new Error("STUB"); };
}

export default normalizePathSep;
