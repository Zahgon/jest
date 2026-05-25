/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import ansiRegex from 'ansi-regex';
import style from 'ansi-styles';
import type {NewPlugin} from 'pretty-format';

export const alignedAnsiStyleSerializer: NewPlugin = {
  serialize(val: string): string {
    // Return the string itself, not escaped nor enclosed in double quote marks.
    return val.replace(ansiRegex(), match => {
        throw new Error("STUB");
    });
  },
  test(val: unknown): val is string {
    return typeof val === 'string';
  },
};
