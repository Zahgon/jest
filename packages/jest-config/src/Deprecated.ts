/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import chalk from 'chalk';
import type {DeprecatedOptions} from 'jest-validate';

function formatDeprecation(message: string): string {
  const lines = [
    message.replaceAll(/\*(.+?)\*/g, (_, s) => { throw new Error("STUB"); }),
    '',
    'Please update your configuration.',
  ];
  return lines.map(s => { throw new Error("STUB"); }).join('\n');
}

const deprecatedOptions: DeprecatedOptions = {
  browser: () =>
    { throw new Error("STUB"); },

  collectCoverageOnlyFrom: (_options: {
    collectCoverageOnlyFrom?: Record<string, boolean>;
  }) => { throw new Error("STUB"); },

  extraGlobals: (_options: {extraGlobals?: string}) => { throw new Error("STUB"); },

  init: () =>
    { throw new Error("STUB"); },

  moduleLoader: (_options: {moduleLoader?: string}) => { throw new Error("STUB"); },

  preprocessorIgnorePatterns: (_options: {
    preprocessorIgnorePatterns?: Array<string>;
  }) => { throw new Error("STUB"); },

  scriptPreprocessor: (_options: {
    scriptPreprocessor?: string;
  }) => { throw new Error("STUB"); },

  setupTestFrameworkScriptFile: (_options: {
    setupTestFrameworkScriptFile?: string;
  }) => { throw new Error("STUB"); },

  testPathDirs: (_options: {
    testPathDirs?: Array<string>;
  }) => { throw new Error("STUB"); },

  testPathPattern: () =>
    { throw new Error("STUB"); },

  testURL: (_options: {testURL?: string}) => { throw new Error("STUB"); },

  timers: (_options: {timers?: string}) => { throw new Error("STUB"); },
};

export default deprecatedOptions;
