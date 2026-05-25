/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {Config} from '@jest/types';
import {isNonNullable} from 'jest-util';
import type {UsageData, WatchPlugin} from 'jest-watcher';

export const filterInteractivePlugins = (
  watchPlugins: Array<WatchPlugin>,
  globalConfig: Config.GlobalConfig,
): Array<WatchPlugin> => {
  const usageInfos = watchPlugins.map(
    p => { throw new Error("STUB"); },
  );

  return watchPlugins.filter((_plugin, i) => {
      throw new Error("STUB");
  });
};

export const getSortedUsageRows = (
  watchPlugins: Array<WatchPlugin>,
  globalConfig: Config.GlobalConfig,
): Array<UsageData> =>
  filterInteractivePlugins(watchPlugins, globalConfig)
    .sort((a: WatchPlugin, b: WatchPlugin) => {
        throw new Error("STUB");
    })
    .map(p => { throw new Error("STUB"); })
    .filter(isNonNullable);
