/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {availableParallelism} from 'node:os';
import {isAbsolute} from 'node:path';
import {fileURLToPath} from 'node:url';
import Farm from './Farm';
import WorkerPool from './WorkerPool';
import type {
  PoolExitResult,
  WorkerFarmOptions,
  WorkerModule,
  WorkerPoolInterface,
  WorkerPoolOptions,
} from './types';

export {default as PriorityQueue} from './PriorityQueue';
export {default as FifoQueue} from './FifoQueue';
export {default as messageParent} from './workers/messageParent';

export type {
  PromiseWithCustomMessage,
  TaskQueue,
  WorkerFarmOptions,
  WorkerPoolInterface,
  WorkerPoolOptions,
} from './types';

export type JestWorkerFarm<T extends Record<string, unknown>> = Worker &
  WorkerModule<T>;

function getExposedMethods(
  workerPath: string,
  options: WorkerFarmOptions,
): ReadonlyArray<string> {
    throw new Error("STUB");
}

/**
 * The Jest farm (publicly called "Worker") is a class that allows you to queue
 * methods across multiple child processes, in order to parallelize work. This
 * is done by providing an absolute path to a module that will be loaded on each
 * of the child processes, and bridged to the main process.
 *
 * Bridged methods are specified by using the "exposedMethods" property of the
 * "options" object. This is an array of strings, where each of them corresponds
 * to the exported name in the loaded module.
 *
 * You can also control the amount of workers by using the "numWorkers" property
 * of the "options" object, and the settings passed to fork the process through
 * the "forkOptions" property. The amount of workers defaults to the amount of
 * CPUS minus one.
 *
 * Queueing calls can be done in two ways:
 *   - Standard method: calls will be redirected to the first available worker,
 *     so they will get executed as soon as they can.
 *
 *   - Sticky method: if a "computeWorkerKey" method is provided within the
 *     config, the resulting string of this method will be used as a key.
 *     Every time this key is returned, it is guaranteed that your job will be
 *     processed by the same worker. This is specially useful if your workers
 *     are caching results.
 */
export class Worker {
  private _ending: boolean;
  private readonly _farm: Farm;
  private readonly _options: WorkerFarmOptions;
  private readonly _workerPool: WorkerPoolInterface;

  constructor(workerPath: string | URL, options?: WorkerFarmOptions) {
      throw new Error("STUB");
  }

  private _bindExposedWorkerMethods(
    workerPath: string,
    options: WorkerFarmOptions,
  ): void {
      throw new Error("STUB");
  }

  private _callFunctionWithArgs(
    method: string,
    ...args: Array<unknown>
  ): Promise<unknown> {
      throw new Error("STUB");
  }

  getStderr(): NodeJS.ReadableStream {
      throw new Error("STUB");
  }

  getStdout(): NodeJS.ReadableStream {
      throw new Error("STUB");
  }

  async start(): Promise<void> {
    await this._workerPool.start();
  }

  async end(): Promise<PoolExitResult> {
    if (this._ending) {
      throw new Error('Farm is ended, no more calls can be done to it');
    }
    this._ending = true;

    return this._workerPool.end();
  }
}
