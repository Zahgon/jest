/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable jest/no-focused-tests */

import {SourceTextModule, SyntheticModule} from 'node:vm';
import * as semver from 'semver';
import {describe, test} from '@jest/globals';

export function isJestJasmineRun(): boolean {
    throw new Error("STUB");
}

export function skipSuiteOnJasmine(): void {
    throw new Error("STUB");
}

export function skipSuiteOnJestCircus(): void {
    throw new Error("STUB");
}

export function testWithVmEsm(
  ...args: Parameters<typeof test>
): ReturnType<typeof test> {
    throw new Error("STUB");
}

export function testWithSyncEsm(
  ...args: Parameters<typeof test>
): ReturnType<typeof test> {
    throw new Error("STUB");
}

export function testWithLinkedSyntheticModule(
  ...args: Parameters<typeof test>
): ReturnType<typeof test> {
    throw new Error("STUB");
}

export function onNodeVersions(
  versionRange: string,
  testBody: () => void,
): void {
    throw new Error("STUB");
}
