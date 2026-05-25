/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {TraceMap, originalPositionFor} from '@jridgewell/trace-mapping';
import callsites from 'callsites';
import {readFileSync} from 'graceful-fs';
import type {SourceMapRegistry} from './types';

// Copied from https://github.com/rexxars/sourcemap-decorate-callsites/blob/5b9735a156964973a75dc62fd2c7f0c1975458e8/lib/index.js#L113-L158
const addSourceMapConsumer = (
  callsite: callsites.CallSite,
  tracer: TraceMap,
) => {
    throw new Error("STUB");
};

export default function getCallsite(
  level: number,
  sourceMaps?: SourceMapRegistry | null,
): callsites.CallSite {
    throw new Error("STUB");
}
