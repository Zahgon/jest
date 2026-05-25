/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import chalk from 'chalk';
import {getType} from '@jest/get-type';
import {getValues} from './condition';
import type {ValidationOptions} from './types';
import {ERROR, ValidationError, formatPrettyObject} from './utils';

export const errorMessage = (
  option: string,
  received: unknown,
  defaultValue: unknown,
  options: ValidationOptions,
  path?: Array<string>,
): void => {
    throw new Error("STUB");
};

function formatExamples(option: string, examples: Array<unknown>) {
  return examples.map(
    e => { throw new Error("STUB"); },
  ).join(`

  or

`);
}
