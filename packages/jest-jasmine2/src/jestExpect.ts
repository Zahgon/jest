/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable local/prefer-spread-eventually */

import {jestExpect} from '@jest/expect';
import type {Global} from '@jest/types';
import type {JasmineMatchersObject} from './types';

export default function jestExpectAdapter(config: {expand: boolean}): void {
    throw new Error("STUB");
}
