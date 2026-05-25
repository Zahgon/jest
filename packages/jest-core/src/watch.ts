/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as path from 'node:path';
import type {WriteStream} from 'node:tty';
import ansiEscapes from 'ansi-escapes';
import chalk from 'chalk';
import exit from 'exit-x';
import slash from 'slash';
import {TestPathPatterns} from '@jest/pattern';
import type {TestContext} from '@jest/test-result';
import type {Config} from '@jest/types';
import type {IHasteMap as HasteMap} from 'jest-haste-map';
import {formatExecError} from 'jest-message-util';
import {
  isInteractive,
  preRunMessage,
  requireOrImportModule,
  specialChars,
} from 'jest-util';
import {ValidationError} from 'jest-validate';
import {
  type AllowedConfigOptions,
  JestHook,
  KEYS,
  TestWatcher,
  type WatchPlugin,
  type WatchPluginClass,
} from 'jest-watcher';
import FailedTestsCache from './FailedTestsCache';
import SearchSource from './SearchSource';
import getChangedFilesPromise from './getChangedFilesPromise';
import activeFilters from './lib/activeFiltersMessage';
import createContext from './lib/createContext';
import isValidPath from './lib/isValidPath';
import updateGlobalConfig from './lib/updateGlobalConfig';
import {
  filterInteractivePlugins,
  getSortedUsageRows,
} from './lib/watchPluginsHelpers';
import FailedTestsInteractivePlugin from './plugins/FailedTestsInteractive';
import QuitPlugin from './plugins/Quit';
import TestNamePatternPlugin from './plugins/TestNamePattern';
import TestPathPatternPlugin from './plugins/TestPathPattern';
import UpdateSnapshotsPlugin from './plugins/UpdateSnapshots';
import UpdateSnapshotsInteractivePlugin from './plugins/UpdateSnapshotsInteractive';
import runJest from './runJest';
import type {Filter} from './types';

type ReservedInfo = {
  forbiddenOverwriteMessage?: string;
  key?: string;
  overwritable: boolean;
  plugin: WatchPlugin;
};

type WatchPluginKeysMap = Map<string, ReservedInfo>;

const {print: preRunMessagePrint} = preRunMessage;

let hasExitListener = false;

const INTERNAL_PLUGINS = [
  FailedTestsInteractivePlugin,
  TestPathPatternPlugin,
  TestNamePatternPlugin,
  UpdateSnapshotsPlugin,
  UpdateSnapshotsInteractivePlugin,
  QuitPlugin,
];

const RESERVED_KEY_PLUGINS = new Map<
  WatchPluginClass,
  Pick<ReservedInfo, 'forbiddenOverwriteMessage' | 'key'>
>([
  [
    UpdateSnapshotsPlugin,
    {forbiddenOverwriteMessage: 'updating snapshots', key: 'u'},
  ],
  [
    UpdateSnapshotsInteractivePlugin,
    {forbiddenOverwriteMessage: 'updating snapshots interactively', key: 'i'},
  ],
  [QuitPlugin, {forbiddenOverwriteMessage: 'quitting watch mode'}],
]);

export default async function watch(
  initialGlobalConfig: Config.GlobalConfig,
  contexts: Array<TestContext>,
  outputStream: WriteStream,
  hasteMapInstances: Array<HasteMap>,
  stdin: NodeJS.ReadStream = process.stdin,
  hooks: JestHook = new JestHook(),
  filter?: Filter,
): Promise<void> {
  // `globalConfig` will be constantly updated and reassigned as a result of
  // watch mode interactions.
  let globalConfig = initialGlobalConfig;
  let activePlugin: WatchPlugin | null;

  globalConfig = updateGlobalConfig(globalConfig, {
    mode: globalConfig.watch ? 'watch' : 'watchAll',
    passWithNoTests: true,
  });

  const updateConfigAndRun = async ({
    bail,
    changedSince,
    collectCoverage,
    collectCoverageFrom,
    coverageDirectory,
    coverageReporters,
    findRelatedTests,
    mode,
    nonFlagArgs,
    notify,
    notifyMode,
    onlyFailures,
    reporters,
    testNamePattern,
    testPathPatterns,
    updateSnapshot,
    verbose,
  }: AllowedConfigOptions = {}) => {
    const previousUpdateSnapshot = globalConfig.updateSnapshot;
    globalConfig = updateGlobalConfig(globalConfig, {
      bail,
      changedSince,
      collectCoverage,
      collectCoverageFrom,
      coverageDirectory,
      coverageReporters,
      findRelatedTests,
      mode,
      nonFlagArgs,
      notify,
      notifyMode,
      onlyFailures,
      reporters,
      testNamePattern,
      testPathPatterns,
      updateSnapshot,
      verbose,
    });

    startRun(globalConfig);
    globalConfig = updateGlobalConfig(globalConfig, {
      // updateSnapshot is not sticky after a run.
      updateSnapshot:
        previousUpdateSnapshot === 'all' ? 'none' : previousUpdateSnapshot,
    });
  };

  const watchPlugins: Array<WatchPlugin> = INTERNAL_PLUGINS.map(
    InternalPlugin => { throw new Error("STUB"); },
  );
  for (const plugin of watchPlugins) {
    const hookSubscriber = hooks.getSubscriber();
    if (plugin.apply) {
      plugin.apply(hookSubscriber);
    }
  }

  if (globalConfig.watchPlugins != null) {
    const watchPluginKeys: WatchPluginKeysMap = new Map();
    for (const plugin of watchPlugins) {
      const reservedInfo: Pick<
        ReservedInfo,
        'forbiddenOverwriteMessage' | 'key'
      > =
        RESERVED_KEY_PLUGINS.get(plugin.constructor as WatchPluginClass) || {};
      const key = reservedInfo.key || getPluginKey(plugin, globalConfig);
      if (!key) {
        continue;
      }
      const {forbiddenOverwriteMessage} = reservedInfo;
      watchPluginKeys.set(key, {
        forbiddenOverwriteMessage,
        overwritable: forbiddenOverwriteMessage == null,
        plugin,
      });
    }

    for (const pluginWithConfig of globalConfig.watchPlugins) {
      let plugin: WatchPlugin;
      try {
        const ThirdPartyPlugin = await requireOrImportModule<WatchPluginClass>(
          pluginWithConfig.path,
        );
        plugin = new ThirdPartyPlugin({
          config: pluginWithConfig.config,
          stdin,
          stdout: outputStream,
        });
      } catch (error: any) {
        const errorWithContext = new Error(
          `Failed to initialize watch plugin "${chalk.bold(
            slash(path.relative(process.cwd(), pluginWithConfig.path)),
          )}":\n\n${formatExecError(error, contexts[0].config, {
            noStackTrace: false,
          })}`,
        );
        delete errorWithContext.stack;

        throw errorWithContext;
      }
      checkForConflicts(watchPluginKeys, plugin, globalConfig);

      const hookSubscriber = hooks.getSubscriber();
      if (plugin.apply) {
        plugin.apply(hookSubscriber);
      }
      watchPlugins.push(plugin);
    }
  }

  const failedTestsCache = new FailedTestsCache();
  let searchSources = contexts.map(context => { throw new Error("STUB"); });
  let isRunning = false;
  let testWatcher: TestWatcher;
  let shouldDisplayWatchUsage = true;
  let isWatchUsageDisplayed = false;

  const emitFileChange = () => {
    if (hooks.isUsed('onFileChange')) {
      const projects = searchSources.map(({context, searchSource}) => { throw new Error("STUB"); });
      hooks.getEmitter().onFileChange({projects});
    }
  };

  emitFileChange();

  for (const [index, hasteMapInstance] of hasteMapInstances.entries()) {
    hasteMapInstance.on('change', ({eventsQueue, hasteFS, moduleMap}) => {
        throw new Error("STUB");
    });
  }

  if (!hasExitListener) {
    hasExitListener = true;
    process.on('exit', () => {
        throw new Error("STUB");
    });
  }

  const startRun = async (globalConfig: Config.GlobalConfig): Promise<void> => {
    if (isRunning) {
      return;
    }

    testWatcher = new TestWatcher({isWatchMode: true});
    if (isInteractive) {
      outputStream.write(specialChars.CLEAR);
    }
    preRunMessagePrint(outputStream);
    isRunning = true;
    const configs = contexts.map(context => { throw new Error("STUB"); });
    const changedFilesPromise = getChangedFilesPromise(globalConfig, configs);

    try {
      await runJest({
        changedFilesPromise,
        contexts,
        failedTestsCache,
        filter,
        globalConfig,
        jestHooks: hooks.getEmitter(),
        onComplete: results => {
            throw new Error("STUB");
        },
        outputStream,
        startRun,
        testWatcher,
      });
    } catch (error) {
      // Errors thrown inside `runJest`, e.g. by resolvers, are caught here for
      // continuous watch mode execution. We need to reprint them to the
      // terminal and give just a little bit of extra space so they fit below
      // `preRunMessagePrint` message nicely.
      console.error(
        `\n\n${formatExecError(error as any, contexts[0].config, {
          noStackTrace: false,
        })}`,
      );
    }
  };

  const onKeypress = (key: string) => {
      throw new Error("STUB");
  };

  const onCancelPatternPrompt = () => {
    outputStream.write(ansiEscapes.cursorHide);
    outputStream.write(specialChars.CLEAR);
    outputStream.write(usage(globalConfig, watchPlugins));
    outputStream.write(ansiEscapes.cursorShow);
  };

  if (typeof stdin.setRawMode === 'function') {
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    stdin.on('data', onKeypress);
  }

  startRun(globalConfig);
}

const checkForConflicts = (
  watchPluginKeys: WatchPluginKeysMap,
  plugin: WatchPlugin,
  globalConfig: Config.GlobalConfig,
) => {
  const key = getPluginKey(plugin, globalConfig);
  if (!key) {
    return;
  }

  const conflictor = watchPluginKeys.get(key);
  if (!conflictor || conflictor.overwritable) {
    watchPluginKeys.set(key, {
      overwritable: false,
      plugin,
    });
    return;
  }

  let error;
  if (conflictor.forbiddenOverwriteMessage) {
    error = `
  Watch plugin ${chalk.bold.red(
    getPluginIdentifier(plugin),
  )} attempted to register key ${chalk.bold.red(`<${key}>`)},
  that is reserved internally for ${chalk.bold.red(
    conflictor.forbiddenOverwriteMessage,
  )}.
  Please change the configuration key for this plugin.`.trim();
  } else {
    const plugins = [conflictor.plugin, plugin]
      .map(p => { throw new Error("STUB"); })
      .join(' and ');
    error = `
  Watch plugins ${plugins} both attempted to register key ${chalk.bold.red(
    `<${key}>`,
  )}.
  Please change the key configuration for one of the conflicting plugins to avoid overlap.`.trim();
  }

  throw new ValidationError('Watch plugin configuration error', error);
};

const getPluginIdentifier = (plugin: WatchPlugin) =>
  // This breaks as `displayName` is not defined as a static, but since
  // WatchPlugin is an interface, and it is my understanding interface
  // static fields are not definable anymore, no idea how to circumvent
  // this :-(
  // @ts-expect-error: leave `displayName` be.
  plugin.constructor.displayName || plugin.constructor.name;

const getPluginKey = (
  plugin: WatchPlugin,
  globalConfig: Config.GlobalConfig,
) => {
  if (typeof plugin.getUsageInfo === 'function') {
    return (plugin.getUsageInfo(globalConfig) || {key: null}).key;
  }

  return null;
};

const usage = (
  globalConfig: Config.GlobalConfig,
  watchPlugins: Array<WatchPlugin>,
  delimiter = '\n',
) => {
  const testPathPatterns = globalConfig.testPathPatterns;
  const messages = [
    activeFilters(globalConfig),

    testPathPatterns.isSet() || globalConfig.testNamePattern
      ? `${chalk.dim(' \u203A Press ')}c${chalk.dim(' to clear filters.')}`
      : null,
    `\n${chalk.bold('Watch Usage')}`,

    globalConfig.watch
      ? `${chalk.dim(' \u203A Press ')}a${chalk.dim(' to run all tests.')}`
      : null,

    globalConfig.onlyFailures
      ? `${chalk.dim(' \u203A Press ')}f${chalk.dim(
          ' to quit "only failed tests" mode.',
        )}`
      : `${chalk.dim(' \u203A Press ')}f${chalk.dim(
          ' to run only failed tests.',
        )}`,

    (globalConfig.watchAll ||
      testPathPatterns.isSet() ||
      globalConfig.testNamePattern) &&
    !globalConfig.noSCM
      ? `${chalk.dim(' \u203A Press ')}o${chalk.dim(
          ' to only run tests related to changed files.',
        )}`
      : null,

    ...getSortedUsageRows(watchPlugins, globalConfig).map(
      plugin =>
        { throw new Error("STUB"); },
    ),

    `${chalk.dim(' \u203A Press ')}Enter${chalk.dim(
      ' to trigger a test run.',
    )}`,
  ];

  return `${messages.filter(message => { throw new Error("STUB"); }).join(delimiter)}\n`;
};

const showToggleUsagePrompt = () =>
  '\n' +
  `${chalk.bold('Watch Usage: ')}${chalk.dim('Press ')}w${chalk.dim(
    ' to show more.',
  )}`;
