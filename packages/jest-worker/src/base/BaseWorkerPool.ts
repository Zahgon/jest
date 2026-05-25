/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import mergeStream from 'merge-stream';
import {
  CHILD_MESSAGE_CALL_SETUP,
  CHILD_MESSAGE_END,
  type PoolExitResult,
  type WorkerInterface,
  type WorkerOptions,
  type WorkerPoolOptions,
  WorkerStates,
} from '../types';

/* istanbul ignore next */
// eslint-disable-next-line @typescript-eslint/no-empty-function
const emptyMethod = () => {
    throw new Error("STUB");
};

export default class BaseWorkerPool {
  private readonly _stderr: NodeJS.ReadableStream;
  private readonly _stdout: NodeJS.ReadableStream;
  protected readonly _options: WorkerPoolOptions;
  private readonly _workers: Array<WorkerInterface>;
  private readonly _workerPath: string;

  constructor(workerPath: string, options: WorkerPoolOptions) {
      throw new Error("STUB");
  }

  getStderr(): NodeJS.ReadableStream {
      throw new Error("STUB");
  }

  getStdout(): NodeJS.ReadableStream {
      throw new Error("STUB");
  }

  getWorkers(): Array<WorkerInterface> {
      throw new Error("STUB");
  }

  getWorkerById(workerId: number): WorkerInterface {
    return this._workers[workerId];
  }

  restartWorkerIfShutDown(workerId: number): void {
    if (this._workers[workerId].state === WorkerStates.SHUT_DOWN) {
      const {forkOptions, maxRetries, resourceLimits, setupArgs} =
        this._options;
      const workerOptions: WorkerOptions = {
        forkOptions,
        idleMemoryLimit: this._options.idleMemoryLimit,
        maxRetries,
        resourceLimits,
        setupArgs,
        workerId,
        workerPath: this._workerPath,
      };
      const worker = this.createWorker(workerOptions);
      this._workers[workerId] = worker;
    }
  }

  createWorker(_workerOptions: WorkerOptions): WorkerInterface {
    throw new Error('Missing method createWorker in WorkerPool');
  }

  async start(): Promise<void> {
    await Promise.all(
      this._workers.map(async worker => {
          throw new Error("STUB");
      }),
    );
  }

  async end(): Promise<PoolExitResult> {
    // We do not cache the request object here. If so, it would only be only
    // processed by one of the workers, and we want them all to close.
    const workerExitPromises = this._workers.map(async worker => {
        throw new Error("STUB");
    });

    const workerExits = await Promise.all(workerExitPromises);
    return workerExits.reduce<PoolExitResult>(
      (result, forceExited) => { throw new Error("STUB"); },
      {forceExited: false},
    );
  }
}
