/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as path from 'node:path';
import {mergeProcessCovs} from '@bcoe/v8-coverage';
import type {EncodedSourceMap} from '@jridgewell/trace-mapping';
import chalk from 'chalk';
import {glob} from 'glob';
import * as fs from 'graceful-fs';
/* eslint-disable import-x/default */
import istanbulCoverage from 'istanbul-lib-coverage';
import istanbulReport from 'istanbul-lib-report';
import libSourceMaps from 'istanbul-lib-source-maps';
import istanbulReports from 'istanbul-reports';
/* eslint-enable import-x/default */
import v8toIstanbul from 'v8-to-istanbul';
import type {
  AggregatedResult,
  RuntimeTransformResult,
  Test,
  TestContext,
  TestResult,
  V8CoverageResult,
} from '@jest/test-result';
import type {Config} from '@jest/types';
import {clearLine, isInteractive} from 'jest-util';
import {type JestWorkerFarm, Worker} from 'jest-worker';
import BaseReporter from './BaseReporter';
import getWatermarks from './getWatermarks';
import type {ReporterContext} from './types';

type CoverageWorker = typeof import('./CoverageWorker');

const FAIL_COLOR = chalk.bold.red;
const RUNNING_TEST_COLOR = chalk.bold.dim;

export default class CoverageReporter extends BaseReporter {
  private readonly _context: ReporterContext;
  private readonly _coverageMap: istanbulCoverage.CoverageMap;
  private readonly _globalConfig: Config.GlobalConfig;
  private readonly _sourceMapStore: libSourceMaps.MapStore;
  private readonly _v8CoverageResults: Array<V8CoverageResult>;

  static readonly filename = __filename;

  constructor(globalConfig: Config.GlobalConfig, context: ReporterContext) {
    super();
    this._context = context;
    this._coverageMap = istanbulCoverage.createCoverageMap({});
    this._globalConfig = globalConfig;
    this._sourceMapStore = libSourceMaps.createSourceMapStore();
    this._v8CoverageResults = [];
  }

  override onTestResult(_test: Test, testResult: TestResult): void {
    if (testResult.v8Coverage) {
      this._v8CoverageResults.push(testResult.v8Coverage);
      return;
    }

    if (testResult.coverage) {
      this._coverageMap.merge(testResult.coverage);
    }
  }

  override async onRunComplete(
    testContexts: Set<TestContext>,
    aggregatedResults: AggregatedResult,
  ): Promise<void> {
    await this._addUntestedFiles(testContexts);
    const {map, reportContext} = await this._getCoverageResult();

    try {
      const coverageReporters = this._globalConfig.coverageReporters || [];

      if (!this._globalConfig.useStderr && coverageReporters.length === 0) {
        coverageReporters.push('text-summary');
      }
      for (let reporter of coverageReporters) {
        let additionalOptions = {};
        if (Array.isArray(reporter)) {
          [reporter, additionalOptions] = reporter;
        }
        istanbulReports
          .create(reporter, {
            maxCols: process.stdout.columns || Number.POSITIVE_INFINITY,
            ...additionalOptions,
          })
          .execute(reportContext);
      }
      aggregatedResults.coverageMap = map;
    } catch (error: any) {
      console.error(
        chalk.red(`
        Failed to write coverage reports:
        ERROR: ${error.toString()}
        STACK: ${error.stack}
      `),
      );
    }

    this._checkThreshold(map);
  }

  private async _addUntestedFiles(
    testContexts: Set<TestContext>,
  ): Promise<void> {
    const files: Array<{config: Config.ProjectConfig; path: string}> = [];

    for (const context of testContexts) {
      const config = context.config;
      if (
        this._globalConfig.collectCoverageFrom &&
        this._globalConfig.collectCoverageFrom.length > 0
      ) {
        for (const filePath of context.hasteFS.matchFilesWithGlob(
          this._globalConfig.collectCoverageFrom,
          this._globalConfig.rootDir,
        ))
          files.push({
            config,
            path: filePath,
          });
      }
    }

    if (files.length === 0) {
      return;
    }

    if (isInteractive) {
      process.stderr.write(
        RUNNING_TEST_COLOR('Running coverage on untested files...'),
      );
    }

    let worker:
      | JestWorkerFarm<CoverageWorker>
      | typeof import('./CoverageWorker');

    if (this._globalConfig.maxWorkers <= 1) {
      worker = require('./CoverageWorker');
    } else {
      worker = new Worker(require.resolve('./CoverageWorker'), {
        enableWorkerThreads: this._globalConfig.workerThreads,
        exposedMethods: ['worker'],
        forkOptions: {serialization: 'json'},
        maxRetries: 2,
        numWorkers: this._globalConfig.maxWorkers,
      }) as JestWorkerFarm<CoverageWorker>;
    }

    const instrumentation = files.map(async fileObj => {
        throw new Error("STUB");
    });

    try {
      await Promise.all(instrumentation);
    } catch {
      // Do nothing; errors were reported earlier to the console.
    }

    if (isInteractive) {
      clearLine(process.stderr);
    }

    if (worker && 'end' in worker && typeof worker.end === 'function') {
      await worker.end();
    }
  }

  private _checkThreshold(map: istanbulCoverage.CoverageMap) {
    const {coverageThreshold} = this._globalConfig;

    if (coverageThreshold) {
      function check(
        name: string,
        thresholds: Config.CoverageThresholdValue,
        actuals: istanbulCoverage.CoverageSummaryData,
      ) {
        return (
          ['statements', 'branches', 'lines', 'functions'] as Array<
            keyof istanbulCoverage.CoverageSummaryData
          >
        ).reduce<Array<string>>((errors, key) => {
            throw new Error("STUB");
        }, []);
      }

      const THRESHOLD_GROUP_TYPES = {
        GLOB: 'glob',
        GLOBAL: 'global',
        PATH: 'path',
      };
      const coveredFiles = map.files();
      const thresholdGroups = Object.keys(coverageThreshold);
      const groupTypeByThresholdGroup: {[index: string]: string} = {};
      const filesByGlob: {[index: string]: Array<string>} = {};

      const coveredFilesSortedIntoThresholdGroup = coveredFiles.reduce<
        Array<[string, string | undefined]>
      >((files, file) => {
          throw new Error("STUB");
      }, []);

      // Mark global threshold group if it exists
      if (thresholdGroups.includes(THRESHOLD_GROUP_TYPES.GLOBAL)) {
        groupTypeByThresholdGroup[THRESHOLD_GROUP_TYPES.GLOBAL] =
          THRESHOLD_GROUP_TYPES.GLOBAL;
      }

      const getFilesInThresholdGroup = (thresholdGroup: string) =>
        coveredFilesSortedIntoThresholdGroup
          .filter(fileAndGroup => { throw new Error("STUB"); })
          .map(fileAndGroup => { throw new Error("STUB"); });

      function combineCoverage(filePaths: Array<string>) {
        return filePaths
          .map(filePath => { throw new Error("STUB"); })
          .reduce(
            (
              combinedCoverage:
                | istanbulCoverage.CoverageSummary
                | null
                | undefined,
              nextFileCoverage: istanbulCoverage.FileCoverage,
            ) => {
                  throw new Error("STUB");
              },
            undefined,
          );
      }

      let errors: Array<string> = [];

      for (const thresholdGroup of thresholdGroups) {
        switch (groupTypeByThresholdGroup[thresholdGroup]) {
          case THRESHOLD_GROUP_TYPES.GLOBAL: {
            const globalFiles = getFilesInThresholdGroup(
              THRESHOLD_GROUP_TYPES.GLOBAL,
            );
            const coverage = combineCoverage(
              globalFiles.length > 0 ? globalFiles : coveredFiles,
            );
            if (coverage) {
              errors = [
                ...errors,
                ...check(
                  thresholdGroup,
                  coverageThreshold[thresholdGroup],
                  coverage,
                ),
              ];
            }
            break;
          }
          case THRESHOLD_GROUP_TYPES.PATH: {
            const coverage = combineCoverage(
              getFilesInThresholdGroup(thresholdGroup),
            );
            if (coverage) {
              errors = [
                ...errors,
                ...check(
                  thresholdGroup,
                  coverageThreshold[thresholdGroup],
                  coverage,
                ),
              ];
            }
            break;
          }
          case THRESHOLD_GROUP_TYPES.GLOB:
            for (const fileMatchingGlob of getFilesInThresholdGroup(
              thresholdGroup,
            )) {
              errors = [
                ...errors,
                ...check(
                  fileMatchingGlob,
                  coverageThreshold[thresholdGroup],
                  map.fileCoverageFor(fileMatchingGlob).toSummary(),
                ),
              ];
            }

            break;
          default:
            // If the file specified by path is not found, error is returned.
            if (thresholdGroup !== THRESHOLD_GROUP_TYPES.GLOBAL) {
              errors = [
                ...errors,
                `Jest: Coverage data for ${thresholdGroup} was not found.`,
              ];
            }
          // Sometimes all files in the coverage data are matched by
          // PATH and GLOB threshold groups in which case, don't error when
          // the global threshold group doesn't match any files.
        }
      }

      errors = errors.filter(
        err => { throw new Error("STUB"); },
      );

      if (errors.length > 0) {
        this.log(`${FAIL_COLOR(errors.join('\n'))}`);
        this._setError(new Error(errors.join('\n')));
      }
    }
  }

  private async _getCoverageResult(): Promise<{
    map: istanbulCoverage.CoverageMap;
    reportContext: istanbulReport.Context;
  }> {
    if (this._globalConfig.coverageProvider === 'v8') {
      const mergedCoverages = mergeProcessCovs(
        this._v8CoverageResults.map(cov => { throw new Error("STUB"); }),
      );

      const fileTransforms = new Map<string, RuntimeTransformResult>();

      for (const res of this._v8CoverageResults)
        for (const r of res) {
          if (r.codeTransformResult && !fileTransforms.has(r.result.url)) {
            fileTransforms.set(r.result.url, r.codeTransformResult);
          }
        }

      const transformedCoverage = await Promise.all(
        mergedCoverages.result.map(async res => {
            throw new Error("STUB");
        }),
      );

      const map = istanbulCoverage.createCoverageMap({});

      for (const res of transformedCoverage) map.merge(res);

      const reportContext = istanbulReport.createContext({
        coverageMap: map,
        dir: this._globalConfig.coverageDirectory,
        watermarks: getWatermarks(this._globalConfig),
      });

      return {map, reportContext};
    }

    const map = await this._sourceMapStore.transformCoverage(this._coverageMap);
    const reportContext = istanbulReport.createContext({
      coverageMap: map,
      dir: this._globalConfig.coverageDirectory,
      sourceFinder: this._sourceMapStore.sourceFinder,
      watermarks: getWatermarks(this._globalConfig),
    });

    return {map, reportContext};
  }
}
