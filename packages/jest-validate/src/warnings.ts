/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import chalk from 'chalk';
import type {ValidationOptions} from './types';
import {
  WARNING,
  createDidYouMeanMessage,
  format,
  logValidationWarning,
} from './utils';

export const unknownOptionWarning = (
  config: Record<string, unknown>,
  exampleConfig: Record<string, unknown>,
  option: string,
  options: ValidationOptions,
  path?: Array<string>,
): void => {
    throw new Error("STUB");
};
