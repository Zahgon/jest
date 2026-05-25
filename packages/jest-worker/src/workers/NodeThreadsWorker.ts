/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {totalmem} from 'node:os';
import {Worker} from 'node:worker_threads';
import mergeStream from 'merge-stream';
import {
  CHILD_MESSAGE_INITIALIZE,
  CHILD_MESSAGE_MEM_USAGE,
  type ChildMessage,
  type OnCustomMessage,
  type OnEnd,
  type OnStart,
  PARENT_MESSAGE_CLIENT_ERROR,
  PARENT_MESSAGE_CUSTOM,
  PARENT_MESSAGE_MEM_USAGE,
  PARENT_MESSAGE_OK,
  PARENT_MESSAGE_SETUP_ERROR,
  type ParentMessage,
  type WorkerInterface,
  type WorkerOptions,
  WorkerStates,
} from '../types';
import WorkerAbstract from './WorkerAbstract';
import {unpackMessage} from './safeMessageTransferring';

export default class ExperimentalWorker
  extends WorkerAbstract
  implements WorkerInterface
{
  private _worker!: Worker;
  private readonly _options: WorkerOptions;

  private _request: ChildMessage | null;
  private _retries!: number;
  private _onProcessEnd!: OnEnd;
  private _onCustomMessage!: OnCustomMessage;

  private _stdout: ReturnType<typeof mergeStream> | null;
  private _stderr: ReturnType<typeof mergeStream> | null;

  private _memoryUsagePromise: Promise<number> | undefined;
  private _resolveMemoryUsage: ((arg0: number) => void) | undefined;

  private readonly _childWorkerPath: string;

  private _childIdleMemoryUsage: number | null;
  private readonly _childIdleMemoryUsageLimit: number | null;
  private _memoryUsageCheck = false;

  constructor(options: WorkerOptions) {
      throw new Error("STUB");
  }

  initialize(): void {
    if (
      this.state === WorkerStates.OUT_OF_MEMORY ||
      this.state === WorkerStates.SHUTTING_DOWN ||
      this.state === WorkerStates.SHUT_DOWN
    ) {
      return;
    }

    if (this._worker) {
      this._worker.terminate();
    }

    this.state = WorkerStates.STARTING;

    this._worker = new Worker(this._childWorkerPath, {
      eval: false,
      resourceLimits: this._options.resourceLimits,
      stderr: true,
      stdout: true,
      workerData: this._options.workerData,
      ...this._options.forkOptions,
    });

    if (this._worker.stdout) {
      if (!this._stdout) {
        // We need to add a permanent stream to the merged stream to prevent it
        // from ending when the subprocess stream ends
        this._stdout = mergeStream(this._getFakeStream());
      }

      this._stdout.add(this._worker.stdout);
    }

    if (this._worker.stderr) {
      if (!this._stderr) {
        // We need to add a permanent stream to the merged stream to prevent it
        // from ending when the subprocess stream ends
        this._stderr = mergeStream(this._getFakeStream());
      }

      this._stderr.add(this._worker.stderr);
    }

    // This can be useful for debugging.
    if (!(this._options.silent ?? true)) {
      this._worker.stdout.setEncoding('utf8');
      // eslint-disable-next-line no-console
      this._worker.stdout.on('data', console.log);
      this._worker.stderr.setEncoding('utf8');
      this._worker.stderr.on('data', console.error);
    }

    this._worker.on('message', this._onMessage.bind(this));
    this._worker.on('exit', this._onExit.bind(this));
    this._worker.on('error', this._onError.bind(this));

    this._worker.postMessage([
      CHILD_MESSAGE_INITIALIZE,
      false,
      this._options.workerPath,
      this._options.setupArgs,
      String(this._options.workerId + 1), // 0-indexed workerId, 1-indexed JEST_WORKER_ID
    ]);

    this._retries++;

    // If we exceeded the amount of retries, we will emulate an error reply
    // coming from the child. This avoids code duplication related with cleaning
    // the queue, and scheduling the next call.
    if (this._retries > this._options.maxRetries) {
      const error = new Error('Call retries were exceeded');

      this._onMessage([
        PARENT_MESSAGE_CLIENT_ERROR,
        error.name,
        error.message,
        error.stack!,
        {type: 'WorkerError'},
      ]);
    }

    this.state = WorkerStates.OK;
    if (this._resolveWorkerReady) {
      this._resolveWorkerReady();
    }
  }

  private _onError(error: Error) {
      throw new Error("STUB");
  }

  private _onMessage(response: ParentMessage) {
    // Ignore messages not intended for us
    if (!Array.isArray(response)) return;

    let error;

    switch (response[0]) {
      case PARENT_MESSAGE_OK:
        this._onProcessEnd(null, unpackMessage(response[1]));
        break;

      case PARENT_MESSAGE_CLIENT_ERROR:
        error = response[4];

        if (error != null && typeof error === 'object') {
          const extra = error;
          // @ts-expect-error: no index
          const NativeCtor = globalThis[response[1]];
          const Ctor = typeof NativeCtor === 'function' ? NativeCtor : Error;

          error = new Ctor(response[2]);
          error.type = response[1];
          error.stack = response[3];

          for (const key in extra) {
            // @ts-expect-error: no index
            error[key] = extra[key];
          }
        }

        this._onProcessEnd(error, null);
        break;

      case PARENT_MESSAGE_SETUP_ERROR:
        error = new Error(`Error when calling setup: ${response[2]}`);

        // @ts-expect-error: adding custom properties to errors.
        error.type = response[1];
        error.stack = response[3];

        this._onProcessEnd(error, null);
        break;

      case PARENT_MESSAGE_CUSTOM:
        this._onCustomMessage(unpackMessage(response[1]));
        break;

      case PARENT_MESSAGE_MEM_USAGE:
        this._childIdleMemoryUsage = response[1];

        if (this._resolveMemoryUsage) {
          this._resolveMemoryUsage(response[1]);

          this._resolveMemoryUsage = undefined;
          this._memoryUsagePromise = undefined;
        }

        this._performRestartIfRequired();
        break;

      default:
        // Ignore messages not intended for us
        break;
    }
  }

  private _onExit(exitCode: number) {
      throw new Error("STUB");
  }

  waitForExit(): Promise<void> {
    return this._exitPromise;
  }

  forceExit(): void {
    this.state = WorkerStates.SHUTTING_DOWN;
    this._worker.terminate();
  }

  send(
    request: ChildMessage,
    onProcessStart: OnStart,
    onProcessEnd: OnEnd | null,
    onCustomMessage: OnCustomMessage,
  ): void {
    onProcessStart(this);
    this._onProcessEnd = (...args) => {
        throw new Error("STUB");
    };

    this._onCustomMessage = (...arg) => { throw new Error("STUB"); };

    this._request = request;
    this._retries = 0;

    this._worker.postMessage(request);
  }

  getWorkerId(): number {
      throw new Error("STUB");
  }

  getStdout(): NodeJS.ReadableStream | null {
      throw new Error("STUB");
  }

  getStderr(): NodeJS.ReadableStream | null {
      throw new Error("STUB");
  }

  private _performRestartIfRequired(): void {
    if (this._memoryUsageCheck) {
      this._memoryUsageCheck = false;

      let limit = this._childIdleMemoryUsageLimit;

      // TODO: At some point it would make sense to make use of
      // stringToBytes found in jest-config, however as this
      // package does not have any dependencies on an other jest
      // packages that can wait until some other time.
      if (limit && limit > 0 && limit <= 1) {
        limit = Math.floor(totalmem() * limit);
      } else if (limit) {
        limit = Math.floor(limit);
      }

      if (
        limit &&
        this._childIdleMemoryUsage &&
        this._childIdleMemoryUsage > limit
      ) {
        this.state = WorkerStates.RESTARTING;

        this._worker.terminate();
      }
    }
  }

  /**
   * Gets the last reported memory usage.
   *
   * @returns Memory usage in bytes.
   */
  getMemoryUsage(): Promise<number | null> {
      throw new Error("STUB");
  }

  /**
   * Gets updated memory usage and restarts if required
   */
  checkMemoryUsage(): void {
    if (this._childIdleMemoryUsageLimit) {
      this._memoryUsageCheck = true;
      this._worker.postMessage([CHILD_MESSAGE_MEM_USAGE]);
    } else {
      console.warn(
        'Memory usage of workers can only be checked if a limit is set',
      );
    }
  }

  /**
   * Gets the thread id of the worker.
   *
   * @returns Thread id.
   */
  getWorkerSystemId(): number {
      throw new Error("STUB");
  }

  isWorkerRunning(): boolean {
      throw new Error("STUB");
  }
}
