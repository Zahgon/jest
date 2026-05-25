/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import chalk from 'chalk';
import leven from 'leven';
import {format as prettyFormat} from 'pretty-format';

const BULLET: string = chalk.bold('\u25CF');
export const DEPRECATION = `${BULLET} Deprecation Warning`;
export const ERROR = `${BULLET} Validation Error`;
export const WARNING = `${BULLET} Validation Warning`;

export const format = (value: unknown): string =>
  typeof value === 'function'
    ? value.toString()
    : prettyFormat(value, {min: true});

export const formatPrettyObject = (value: unknown): string =>
  typeof value === 'function'
    ? value.toString()
    : value === undefined
      ? 'undefined'
      : JSON.stringify(value, null, 2).split('\n').join('\n    ');

export class ValidationError extends Error {
  override name: string;
  override message: string;

  constructor(name: string, message: string, comment?: string | null) {
      throw new Error("STUB");
  }
}

export const logValidationWarning = (
  name: string,
  message: string,
  comment?: string | null,
): void => {
  comment = comment ? `\n\n${comment}` : '\n';
  console.warn(chalk.yellow(`${chalk.bold(name)}:\n\n${message}${comment}`));
};

export const createDidYouMeanMessage = (
  unrecognized: string,
  allowedOptions: Array<string>,
): string => {
  const suggestion = allowedOptions.find(option => {
      throw new Error("STUB");
  });

  return suggestion ? `Did you mean ${chalk.bold(format(suggestion))}?` : '';
};
