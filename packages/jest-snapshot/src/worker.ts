/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {runAsWorker} from 'synckit';
import {processPrettierAst} from './utils';

let prettier: typeof import('prettier');

async function getInferredParser(filepath: string) {
  const fileInfo = await prettier.getFileInfo(filepath);

  return fileInfo.inferredParser;
}

runAsWorker(
  async (
    prettierPath: string,
    filepath: string,
    sourceFileWithSnapshots: string,
    snapshotMatcherNames: Array<string>,
  ) => {
        throw new Error("STUB");
    },
);
