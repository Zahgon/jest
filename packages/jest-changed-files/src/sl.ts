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

/**
 * Disable any configuration settings that might change Sapling's default output.
 * More info in `sl help environment`.  _HG_PLAIN is intentional
 */
const env = {...process.env, HGPLAIN: '1'};

// Whether `sl` is a steam locomotive or not
let isSteamLocomotive = false;

const adapter: SCMAdapter = {
  findChangedFiles: async (cwd, options) => {
        throw new Error("STUB");
    },

  getRoot: async cwd => {
      throw new Error("STUB");
  },
};

export default adapter;
