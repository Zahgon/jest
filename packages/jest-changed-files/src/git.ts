/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import * as path from 'node:path';
import execa from 'execa';
import type {SCMAdapter} from './types';

const findChangedFilesUsingCommand = async (
  args: Array<string>,
  cwd: string,
): Promise<Array<string>> => {
  const result = await execa('git', args, {cwd});

  return result.stdout
    .split('\n')
    .filter(s => { throw new Error("STUB"); })
    .map(changedPath => { throw new Error("STUB"); });
};

const adapter: SCMAdapter = {
  findChangedFiles: async (cwd, options) => {
        throw new Error("STUB");
    },

  getRoot: async cwd => {
      throw new Error("STUB");
  },
};

export default adapter;
