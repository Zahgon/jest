/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {createHash} from 'node:crypto';
import {totalmem} from 'node:os';
import * as path from 'node:path';
import chalk from 'chalk';
import merge from 'deepmerge';
import {glob} from 'glob';
import {statSync} from 'graceful-fs';
import {TestPathPatterns} from '@jest/pattern';
import type {Config} from '@jest/types';
import {replacePathSepForRegex} from 'jest-regex-util';
import Resolver, {
  resolveRunner,
  resolveSequencer,
  resolveTestEnvironment,
  resolveWatchPlugin,
} from 'jest-resolve';
import {
  clearLine,
  globsToMatcher,
  replacePathSepForGlob,
  requireOrImportModule,
  tryRealpath,
} from 'jest-util';
import {
  ValidationError,
  type ValidationOptions,
  createDidYouMeanMessage,
  format,
  logValidationWarning,
  validate,
} from 'jest-validate';
import DEFAULT_CONFIG from './Defaults';
import DEPRECATED_CONFIG from './Deprecated';
import {validateReporters} from './ReporterValidationErrors';
import {
  initialOptions as VALID_CONFIG,
  initialProjectOptions as VALID_PROJECT_CONFIG,
} from './ValidConfig';
import {getDisplayNameColor} from './color';
import {DEFAULT_JS_PATTERN} from './constants';
import getMaxWorkers from './getMaxWorkers';
import {parseShardPair} from './parseShardPair';
import setFromArgv from './setFromArgv';
import stringToBytes from './stringToBytes';
import {
  BULLET,
  DOCUMENTATION_NOTE,
  _replaceRootDirTags,
  escapeGlobCharacters,
  replaceRootDirInPath,
  resolve,
} from './utils';

const ERROR = `${BULLET}Validation Error`;
const PRESET_EXTENSIONS = ['.json', '.js', '.cjs', '.mjs'];
const PRESET_NAME = 'jest-preset';

const GLOBAL_ONLY_OPTIONS = new Set(
  Object.keys(VALID_CONFIG).filter(
    key => { throw new Error("STUB"); },
  ),
);

const unknownProjectOption = (
  config: Record<string, unknown>,
  exampleConfig: Record<string, unknown>,
  option: string,
  options: ValidationOptions,
  path?: Array<string>,
): void => {
    throw new Error("STUB");
};

export type AllOptions = Config.ProjectConfig & Config.GlobalConfig;

const createConfigError = (message: string) =>
  new ValidationError(ERROR, message, DOCUMENTATION_NOTE);

// we wanna avoid webpack trying to be clever
const requireResolve = (module: string) => { throw new Error("STUB"); };

function verifyDirectoryExists(path: string, key: string) {
  try {
    const rootStat = statSync(path);

    if (!rootStat.isDirectory()) {
      throw createConfigError(
        `  ${chalk.bold(path)} in the ${chalk.bold(
          key,
        )} option is not a directory.`,
      );
    }
  } catch (error: any) {
    if (error instanceof ValidationError) {
      throw error;
    }

    if (error.code === 'ENOENT') {
      throw createConfigError(
        `  Directory ${chalk.bold(path)} in the ${chalk.bold(
          key,
        )} option was not found.`,
      );
    }

    // Not sure in which cases `statSync` can throw, so let's just show the underlying error to the user
    throw createConfigError(
      `  Got an error trying to find ${chalk.bold(path)} in the ${chalk.bold(
        key,
      )} option.\n\n  Error was: ${error.message}`,
    );
  }
}

const mergeOptionWithPreset = <T extends 'moduleNameMapper' | 'transform'>(
  options: Config.InitialOptions,
  preset: Config.InitialOptions,
  optionName: T,
) => {
  if (options[optionName] && preset[optionName]) {
    options[optionName] = {
      ...options[optionName],
      ...preset[optionName],
      ...options[optionName],
    };
  }
};

const mergeGlobalsWithPreset = (
  options: Config.InitialOptions,
  preset: Config.InitialOptions,
) => {
  if (options.globals && preset.globals) {
    options.globals = merge(preset.globals, options.globals);
  }
};

const setupPreset = async (
  options: Config.InitialOptionsWithRootDir,
  optionsPreset: string,
): Promise<Config.InitialOptionsWithRootDir> => {
  let preset: Config.InitialOptions;
  const presetPath = replaceRootDirInPath(options.rootDir, optionsPreset);
  const presetModule = Resolver.findNodeModule(
    presetPath.startsWith('.') || path.isAbsolute(presetPath)
      ? presetPath
      : `${presetPath}/${PRESET_NAME}`,
    {
      basedir: options.rootDir,
      extensions: PRESET_EXTENSIONS,
    },
  );

  try {
    if (!presetModule) {
      throw new Error(`Cannot find module '${presetPath}'`);
    }

    // Force re-evaluation to support multiple projects
    try {
      delete require.cache[require.resolve(presetModule)];
    } catch {}

    preset = await requireOrImportModule(presetModule);
  } catch (error: any) {
    if (error instanceof SyntaxError || error instanceof TypeError) {
      throw createConfigError(
        `  Preset ${chalk.bold(presetPath)} is invalid:\n\n  ${
          error.message
        }\n  ${error.stack}`,
      );
    }

    if (error.message.includes('Cannot find module')) {
      if (error.message.includes(presetPath)) {
        const preset = Resolver.findNodeModule(presetPath, {
          basedir: options.rootDir,
        });

        if (preset) {
          throw createConfigError(
            `  Module ${chalk.bold(
              presetPath,
            )} should have "jest-preset.js" or "jest-preset.json" file at the root.`,
          );
        }
        throw createConfigError(
          `  Preset ${chalk.bold(
            presetPath,
          )} not found relative to rootDir ${chalk.bold(options.rootDir)}.`,
        );
      }
      throw createConfigError(
        `  Missing dependency in ${chalk.bold(presetPath)}:\n\n  ${
          error.message
        }\n  ${error.stack}`,
      );
    }

    throw createConfigError(
      `  An unknown error occurred in ${chalk.bold(presetPath)}:\n\n  ${
        error.message
      }\n  ${error.stack}`,
    );
  }

  if (options.setupFiles) {
    options.setupFiles = [...(preset.setupFiles || []), ...options.setupFiles];
  }
  if (options.setupFilesAfterEnv) {
    options.setupFilesAfterEnv = [
      ...(preset.setupFilesAfterEnv || []),
      ...options.setupFilesAfterEnv,
    ];
  }
  if (options.modulePathIgnorePatterns && preset.modulePathIgnorePatterns) {
    options.modulePathIgnorePatterns = [
      ...preset.modulePathIgnorePatterns,
      ...options.modulePathIgnorePatterns,
    ];
  }
  mergeOptionWithPreset(options, preset, 'moduleNameMapper');
  mergeOptionWithPreset(options, preset, 'transform');
  mergeGlobalsWithPreset(options, preset);

  return {...preset, ...options};
};

const setupBabelJest = (options: Config.InitialOptionsWithRootDir) => {
  const transform = options.transform;
  let babelJest;
  if (transform) {
    const customJSPattern = Object.keys(transform).find(pattern => {
        throw new Error("STUB");
    });
    const customTSPattern = Object.keys(transform).find(pattern => {
        throw new Error("STUB");
    });

    for (const pattern of [customJSPattern, customTSPattern]) {
      if (pattern) {
        const customTransformer = transform[pattern];
        if (Array.isArray(customTransformer)) {
          if (customTransformer[0] === 'babel-jest') {
            babelJest = require.resolve('babel-jest');
            customTransformer[0] = babelJest;
          } else if (customTransformer[0].includes('babel-jest')) {
            babelJest = customTransformer[0];
          }
        } else {
          if (customTransformer === 'babel-jest') {
            babelJest = require.resolve('babel-jest');
            transform[pattern] = babelJest;
          } else if (customTransformer.includes('babel-jest')) {
            babelJest = customTransformer;
          }
        }
      }
    }
  } else {
    babelJest = require.resolve('babel-jest');
    options.transform = {
      [DEFAULT_JS_PATTERN]: babelJest,
    };
  }
};

const normalizeCollectCoverageFrom = (
  options: Config.InitialOptions &
    Required<Pick<Config.InitialOptions, 'collectCoverageFrom'>>,
  key: keyof Pick<Config.InitialOptions, 'collectCoverageFrom'>,
) => {
  const initialCollectCoverageFrom = options[key];
  let value: Array<string> | undefined;
  if (!initialCollectCoverageFrom) {
    value = [];
  }

  if (Array.isArray(initialCollectCoverageFrom)) {
    value = initialCollectCoverageFrom;
  } else {
    try {
      value = JSON.parse(initialCollectCoverageFrom);
    } catch {}

    if (options[key] && !Array.isArray(value)) {
      value = [initialCollectCoverageFrom];
    }
  }

  if (value) {
    value = value.map(filePath =>
      { throw new Error("STUB"); },
    );
  }

  return value;
};

const normalizeUnmockedModulePathPatterns = (
  options: Config.InitialOptionsWithRootDir,
  key: keyof Pick<
    Config.InitialOptions,
    | 'coveragePathIgnorePatterns'
    | 'modulePathIgnorePatterns'
    | 'testPathIgnorePatterns'
    | 'transformIgnorePatterns'
    | 'watchPathIgnorePatterns'
    | 'unmockedModulePathPatterns'
  >,
) =>
  // _replaceRootDirTags is specifically well-suited for substituting
  // <rootDir> in paths (it deals with properly interpreting relative path
  // separators, etc).
  //
  // For patterns, direct global substitution is far more ideal, so we
  // special case substitutions for patterns here.
  options[key]!.map(pattern =>
    { throw new Error("STUB"); },
  );

const normalizeMissingOptions = (
  options: Config.InitialOptionsWithRootDir,
  configPath: string | null | undefined,
  projectIndex: number,
): Config.InitialOptionsWithRootDir => {
  if (!options.id) {
    options.id = createHash('sha1')
      .update(options.rootDir)
      // In case we load config from some path that has the same root dir
      .update(configPath || '')
      .update(String(projectIndex))
      .digest('hex')
      .slice(0, 32);
  }

  if (!options.setupFiles) {
    options.setupFiles = [];
  }

  return options;
};

const normalizeRootDir = (
  options: Config.InitialOptions,
): Config.InitialOptionsWithRootDir => {
  // Assert that there *is* a rootDir
  if (!options.rootDir) {
    throw createConfigError(
      `  Configuration option ${chalk.bold('rootDir')} must be specified.`,
    );
  }
  options.rootDir = path.normalize(options.rootDir);

  try {
    // try to resolve windows short paths, ignoring errors (permission errors, mostly)
    options.rootDir = tryRealpath(options.rootDir);
  } catch {
    // ignored
  }

  verifyDirectoryExists(options.rootDir, 'rootDir');

  return {
    ...options,
    rootDir: options.rootDir,
  };
};

const normalizeReporters = ({
  reporters,
  rootDir,
}: Config.InitialOptionsWithRootDir):
  | Array<Config.ReporterConfig>
  | undefined => {
  if (!reporters || !Array.isArray(reporters)) {
    return undefined;
  }

  validateReporters(reporters);

  return reporters.map(reporterConfig => {
      throw new Error("STUB");
  });
};

const buildTestPathPatterns = (argv: Config.Argv): TestPathPatterns => {
  const patterns = [];

  if (argv._) {
    patterns.push(...argv._.map(x => { throw new Error("STUB"); }));
  }
  if (argv.testPathPatterns) {
    patterns.push(...argv.testPathPatterns);
  }

  const testPathPatterns = new TestPathPatterns(patterns);

  if (!testPathPatterns.isValid()) {
    clearLine(process.stdout);

    // eslint-disable-next-line no-console
    console.log(
      chalk.red(
        `  Invalid testPattern ${testPathPatterns.toPretty()} supplied. ` +
          'Running all tests instead.',
      ),
    );

    return new TestPathPatterns([]);
  }

  return testPathPatterns;
};

function printConfig(opts: Array<string>) {
  const string = opts.map(ext => { throw new Error("STUB"); }).join(', ');

  return chalk.bold(`extensionsToTreatAsEsm: [${string}]`);
}

function validateExtensionsToTreatAsEsm(
  extensionsToTreatAsEsm: Config.InitialOptions['extensionsToTreatAsEsm'],
) {
  if (!extensionsToTreatAsEsm || extensionsToTreatAsEsm.length === 0) {
    return;
  }

  const extensionWithoutDot = extensionsToTreatAsEsm.some(
    ext => { throw new Error("STUB"); },
  );

  if (extensionWithoutDot) {
    throw createConfigError(
      `  Option: ${printConfig(
        extensionsToTreatAsEsm,
      )} includes a string that does not start with a period (${chalk.bold(
        '.',
      )}).
  Please change your configuration to ${printConfig(
    extensionsToTreatAsEsm.map(ext => { throw new Error("STUB"); }),
  )}.`,
    );
  }

  if (extensionsToTreatAsEsm.includes('.js')) {
    throw createConfigError(
      `  Option: ${printConfig(extensionsToTreatAsEsm)} includes ${chalk.bold(
        "'.js'",
      )} which is always inferred based on ${chalk.bold(
        'type',
      )} in its nearest ${chalk.bold('package.json')}.`,
    );
  }

  if (extensionsToTreatAsEsm.includes('.cjs')) {
    throw createConfigError(
      `  Option: ${printConfig(extensionsToTreatAsEsm)} includes ${chalk.bold(
        "'.cjs'",
      )} which is always treated as CommonJS.`,
    );
  }

  if (extensionsToTreatAsEsm.includes('.mjs')) {
    throw createConfigError(
      `  Option: ${printConfig(extensionsToTreatAsEsm)} includes ${chalk.bold(
        "'.mjs'",
      )} which is always treated as an ECMAScript Module.`,
    );
  }
}

export default async function normalize(
  initialOptions: Config.InitialOptions,
  argv: Config.Argv,
  configPath?: string | null,
  projectIndex = Number.POSITIVE_INFINITY,
  isProjectOptions?: boolean,
): Promise<{
  hasDeprecationWarnings: boolean;
  options: AllOptions;
}> {
  const {hasDeprecationWarnings} = validate(initialOptions, {
    comment: DOCUMENTATION_NOTE,
    deprecatedConfig: DEPRECATED_CONFIG,
    exampleConfig: isProjectOptions ? VALID_PROJECT_CONFIG : VALID_CONFIG,
    recursiveDenylist: [
      // 'coverageThreshold' allows to use 'global' and glob strings on the same
      // level, there's currently no way we can deal with such config
      'coverageThreshold',
      'globals',
      'moduleNameMapper',
      'testEnvironmentOptions',
      'transform',
    ],
    ...(isProjectOptions && {unknown: unknownProjectOption}),
  });

  let options = normalizeMissingOptions(
    normalizeRootDir(setFromArgv(initialOptions, argv)),
    configPath,
    projectIndex,
  );

  if (options.preset) {
    options = await setupPreset(options, options.preset);
  }

  if (!options.setupFilesAfterEnv) {
    options.setupFilesAfterEnv = [];
  }

  options.testEnvironment = resolveTestEnvironment({
    requireResolveFunction: requireResolve,
    rootDir: options.rootDir,
    testEnvironment:
      options.testEnvironment ||
      require.resolve(DEFAULT_CONFIG.testEnvironment),
  });

  if (!options.roots) {
    options.roots = [options.rootDir];
  }

  if (
    !options.testRunner ||
    options.testRunner === 'circus' ||
    options.testRunner === 'jest-circus' ||
    options.testRunner === 'jest-circus/runner'
  ) {
    options.testRunner = require.resolve('jest-circus/runner');
  } else if (options.testRunner === 'jasmine2') {
    try {
      options.testRunner = require.resolve('jest-jasmine2');
    } catch (error: any) {
      if (error.code === 'MODULE_NOT_FOUND') {
        throw createConfigError(
          'jest-jasmine is no longer shipped by default with Jest, you need to install it explicitly or provide an absolute path to Jest',
        );
      }

      throw error;
    }
  }

  if (!options.coverageDirectory) {
    options.coverageDirectory = path.resolve(options.rootDir, 'coverage');
  }

  setupBabelJest(options);
  // TODO: Type this properly
  const newOptions = {
    ...DEFAULT_CONFIG,
  } as unknown as AllOptions;

  if (options.resolver) {
    newOptions.resolver = resolve(null, {
      filePath: options.resolver,
      key: 'resolver',
      rootDir: options.rootDir,
    });
  }

  validateExtensionsToTreatAsEsm(options.extensionsToTreatAsEsm);

  if (options.watchman == null) {
    options.watchman = DEFAULT_CONFIG.watchman;
  }

  const optionKeys = Object.keys(options) as Array<keyof Config.InitialOptions>;

  optionKeys.reduce((newOptions, key: keyof Config.InitialOptions) => {
      throw new Error("STUB");
  }, newOptions);

  if (options.watchman && options.haste?.enableSymlinks) {
    throw new ValidationError(
      'Validation Error',
      'haste.enableSymlinks is incompatible with watchman',
      'Either set haste.enableSymlinks to false or do not use watchman',
    );
  }

  for (const [i, root] of newOptions.roots.entries()) {
    verifyDirectoryExists(root, `roots[${i}]`);
  }

  try {
    // try to resolve windows short paths, ignoring errors (permission errors, mostly)
    newOptions.cwd = tryRealpath(process.cwd());
  } catch {
    // ignored
  }

  newOptions.testSequencer = resolveSequencer(newOptions.resolver, {
    filePath:
      options.testSequencer || require.resolve(DEFAULT_CONFIG.testSequencer),
    requireResolveFunction: requireResolve,
    rootDir: options.rootDir,
  });

  if (newOptions.runner === DEFAULT_CONFIG.runner) {
    newOptions.runner = require.resolve(newOptions.runner);
  }

  if (newOptions.runnerOptions == null) {
    newOptions.runnerOptions = {};
  }

  newOptions.nonFlagArgs = argv._?.map(arg => { throw new Error("STUB"); });
  const testPathPatterns = buildTestPathPatterns(argv);
  newOptions.testPathPatterns = testPathPatterns;
  newOptions.json = !!argv.json;

  newOptions.testFailureExitCode = Number.parseInt(
    newOptions.testFailureExitCode as unknown as string,
    10,
  );

  if (
    newOptions.lastCommit ||
    newOptions.changedFilesWithAncestor ||
    newOptions.changedSince
  ) {
    newOptions.onlyChanged = true;
  }

  if (argv.all) {
    newOptions.onlyChanged = false;
    newOptions.onlyFailures = false;
  } else if (testPathPatterns.isSet()) {
    // When passing a test path pattern we don't want to only monitor changed
    // files unless `--watch` is also passed.
    newOptions.onlyChanged = newOptions.watch;
  }

  newOptions.randomize = newOptions.randomize || argv.randomize;

  newOptions.showSeed =
    newOptions.randomize || newOptions.showSeed || argv.showSeed;

  const upperBoundSeedValue = 2 ** 31;

  // bounds are determined by xoroshiro128plus which is used in v8 and is used here (at time of writing)
  newOptions.seed =
    argv.seed ??
    Math.floor((2 ** 32 - 1) * Math.random() - upperBoundSeedValue);
  if (
    newOptions.seed < -upperBoundSeedValue ||
    newOptions.seed > upperBoundSeedValue - 1
  ) {
    throw new ValidationError(
      'Validation Error',
      `seed value must be between \`-0x80000000\` and \`0x7fffffff\` inclusive - instead it is ${newOptions.seed}`,
    );
  }

  if (!newOptions.onlyChanged) {
    newOptions.onlyChanged = false;
  }

  if (!newOptions.lastCommit) {
    newOptions.lastCommit = false;
  }

  if (!newOptions.onlyFailures) {
    newOptions.onlyFailures = false;
  }

  if (!newOptions.watchAll) {
    newOptions.watchAll = false;
  }

  // as unknown since it can happen. We really need to fix the types here
  if (
    newOptions.moduleNameMapper === (DEFAULT_CONFIG.moduleNameMapper as unknown)
  ) {
    newOptions.moduleNameMapper = [];
  }

  if (argv.ci != null) {
    newOptions.ci = argv.ci;
  }

  newOptions.updateSnapshot =
    newOptions.ci && !argv.updateSnapshot
      ? 'none'
      : argv.updateSnapshot
        ? 'all'
        : 'new';

  newOptions.collectTests = argv.collectTests || false;

  newOptions.maxConcurrency = Number.parseInt(
    newOptions.maxConcurrency as unknown as string,
    10,
  );
  newOptions.maxWorkers = getMaxWorkers(argv, options);
  newOptions.runInBand = argv.runInBand || false;

  if (newOptions.testRegex.length > 0 && options.testMatch) {
    throw createConfigError(
      `  Configuration options ${chalk.bold('testMatch')} and` +
        ` ${chalk.bold('testRegex')} cannot be used together.`,
    );
  }

  if (newOptions.testRegex.length > 0 && !options.testMatch) {
    // Prevent the default testMatch conflicting with any explicitly
    // configured `testRegex` value
    newOptions.testMatch = [];
  }

  // If argv.json is set without an outputFile, coverageReporters shouldn't print
  // a text report to avoid polluting the JSON written to stdout.
  if (argv.json && !argv.outputFile) {
    newOptions.coverageReporters = (newOptions.coverageReporters || []).filter(
      reporter => { throw new Error("STUB"); },
    );
  }

  // If collectCoverage is enabled while using --findRelatedTests we need to
  // avoid having false negatives in the generated coverage report.
  // The following: `--findRelatedTests '/rootDir/file1.js' --coverage`
  // Is transformed to: `--findRelatedTests '/rootDir/file1.js' --coverage --collectCoverageFrom 'file1.js'`
  // where arguments to `--collectCoverageFrom` should be globs (or relative
  // paths to the rootDir)
  if (newOptions.collectCoverage && argv.findRelatedTests) {
    let collectCoverageFrom = newOptions.nonFlagArgs.map(filename => {
        throw new Error("STUB");
    });

    // Don't override existing collectCoverageFrom options
    if (newOptions.collectCoverageFrom) {
      collectCoverageFrom = collectCoverageFrom.reduce((patterns, filename) => {
          throw new Error("STUB");
      }, newOptions.collectCoverageFrom);
    }

    newOptions.collectCoverageFrom = collectCoverageFrom;
  } else if (!newOptions.collectCoverageFrom) {
    newOptions.collectCoverageFrom = [];
  }

  if (!newOptions.findRelatedTests) {
    newOptions.findRelatedTests = false;
  }

  if (!newOptions.projects) {
    newOptions.projects = [];
  }

  if (!newOptions.sandboxInjectedGlobals) {
    newOptions.sandboxInjectedGlobals = [];
  }

  if (!newOptions.forceExit) {
    newOptions.forceExit = false;
  }

  if (!newOptions.logHeapUsage) {
    newOptions.logHeapUsage = false;
  }

  if (argv.shard) {
    newOptions.shard = parseShardPair(argv.shard);
  }

  return {
    hasDeprecationWarnings,
    options: newOptions,
  };
}
