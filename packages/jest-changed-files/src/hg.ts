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

const env = {...process.env, HGPLAIN: '1'};

const adapter: SCMAdapter = {
  findChangedFiles: async (cwd, options) => {
        throw new Error("STUB");
    },

  getRoot: async cwd => {
      throw new Error("STUB");
  },
};

export default adapter;
