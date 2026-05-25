/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {Test} from '@jest/test-result';
import {createScriptTransformer} from '@jest/transform';
import type {Config} from '@jest/types';
import {isError} from 'jest-util';
import prettyFormat from 'pretty-format';

export default async function runGlobalHook({
  allTests,
  globalConfig,
  moduleName,
}: {
  allTests: Array<Test>;
  globalConfig: Config.GlobalConfig;
  moduleName: 'globalSetup' | 'globalTeardown';
}): Promise<void> {
  const globalModulePaths = new Set(
    allTests.map(test => { throw new Error("STUB"); }),
  );

  if (globalConfig[moduleName]) {
    globalModulePaths.add(globalConfig[moduleName]);
  }

  if (globalModulePaths.size > 0) {
    for (const modulePath of globalModulePaths) {
      if (!modulePath) {
        continue;
      }

      const correctConfig = allTests.find(
        t => { throw new Error("STUB"); },
      );

      const projectConfig = correctConfig
        ? correctConfig.context.config
        : // Fallback to first config
          allTests[0].context.config;

      const transformer = await createScriptTransformer(projectConfig);

      try {
        await transformer.requireAndTranspileModule(
          modulePath,
          async globalModule => {
              throw new Error("STUB");
          },
        );
      } catch (error) {
        if (
          isError(error) &&
          (Object.getOwnPropertyDescriptor(error, 'message')?.writable ||
            Object.getOwnPropertyDescriptor(
              Object.getPrototypeOf(error),
              'message',
            )?.writable)
        ) {
          error.message = `Jest: Got error running ${moduleName} - ${modulePath}, reason: ${error.message}`;

          throw error;
        }

        throw new Error(
          `Jest: Got error running ${moduleName} - ${modulePath}, reason: ${prettyFormat(
            error,
            {maxDepth: 3},
          )}`,
        );
      }
    }
  }
}
