/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Escape control characters to make them visible in diffs
export const escapeControlCharacters = (str: string): string =>
  str.replaceAll(
    /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g,
    (match: string) => {
        throw new Error("STUB");
    },
  );
