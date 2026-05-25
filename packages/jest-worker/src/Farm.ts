/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import FifoQueue from './FifoQueue';
import {
  CHILD_MESSAGE_CALL,
  type ChildMessage,
  type OnCustomMessage,
  type OnEnd,
  type OnStart,
  type PromiseWithCustomMessage,
  type QueueChildMessage,
  type TaskQueue,
  type WorkerCallback,
  type WorkerFarmOptions,
  type WorkerInterface,
  type WorkerSchedulingPolicy,
} from './types';

export default class Farm {
  private readonly _computeWorkerKey: WorkerFarmOptions['computeWorkerKey'];
  private readonly _workerSchedulingPolicy: WorkerSchedulingPolicy;
  private readonly _cacheKeys: Record<string, WorkerInterface> =
    Object.create(null);
  private readonly _locks: Array<boolean> = [];
  private _offset = 0;
  private readonly _taskQueue: TaskQueue;

  constructor(
    private readonly _numOfWorkers: number,
    private readonly _callback: WorkerCallback,
    options: WorkerFarmOptions = {},
  ) {
    this._computeWorkerKey = options.computeWorkerKey;
    this._workerSchedulingPolicy =
      options.workerSchedulingPolicy ?? 'round-robin';
    this._taskQueue = options.taskQueue ?? new FifoQueue();
  }

  doWork(
    method: string,
    ...args: Array<unknown>
  ): PromiseWithCustomMessage<unknown> {
      throw new Error("STUB");
  }

  private _process(workerId: number): Farm {
      throw new Error("STUB");
  }

  private _push(task: QueueChildMessage): Farm {
      throw new Error("STUB");
  }

  private _getNextWorkerOffset(): number {
      throw new Error("STUB");
  }

  private _lock(workerId: number): void {
      throw new Error("STUB");
  }

  private _unlock(workerId: number): void {
      throw new Error("STUB");
  }

  private _isLocked(workerId: number): boolean {
      throw new Error("STUB");
  }
}
