/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import chalk from 'chalk';
import type {Config} from '@jest/types';
import {pluralize} from 'jest-util';
import type {Stats, TestRunData} from './types';

export default function getNoTestFoundVerbose(
  testRunData: TestRunData,
  globalConfig: Config.GlobalConfig,
  willExitWith0: boolean,
): string {
  const individualResults = testRunData.map(testRun => {
      throw new Error("STUB");
  });
  let dataMessage;

  if (globalConfig.runTestsByPath) {
    dataMessage = `Files: ${globalConfig.nonFlagArgs
      .map(p => { throw new Error("STUB"); })
      .join(', ')}`;
  } else {
    dataMessage = `Pattern: ${chalk.yellow(
      globalConfig.testPathPatterns.toPretty(),
    )} - 0 matches`;
  }

  if (willExitWith0) {
    return `${chalk.bold(
      'No tests found, exiting with code 0',
    )}\n${individualResults.join('\n')}\n${dataMessage}`;
  }

  return (
    `${chalk.bold('No tests found, exiting with code 1')}\n` +
    'Run with `--passWithNoTests` to exit with code 0' +
    `\n${individualResults.join('\n')}\n${dataMessage}`
  );
}
