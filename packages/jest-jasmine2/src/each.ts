/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {JestEnvironment} from '@jest/environment';
import {bind as bindEach} from 'jest-each';

export default function each(environment: JestEnvironment): void {
    throw new Error("STUB");
}
