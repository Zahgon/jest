/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {AggregatedResult} from '@jest/test-result';

type CoverageMap = AggregatedResult['coverageMap'];

function summarize(coverageMap: CoverageMap): CoverageMap {
    throw new Error("STUB");
}

export default function PhabricatorProcessor(
  results: AggregatedResult,
): AggregatedResult {
    throw new Error("STUB");
}
