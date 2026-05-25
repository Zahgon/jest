/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {EventEmitter, PassThrough} from 'node:stream';
import {
  WorkerEvents,
  type WorkerInterface,
  type WorkerOptions,
  WorkerStates,
} from '../types';

export default abstract class WorkerAbstract
  extends EventEmitter
  implements Pick<WorkerInterface, 'waitForWorkerReady' | 'state'>
{
  /**
   * DO NOT WRITE TO THIS DIRECTLY.
   * Use this.state getter/setters so events are emitted correctly.
   */
  #state = WorkerStates.STARTING;

  protected _fakeStream: PassThrough | null = null;

  protected _exitPromise: Promise<void>;
  protected _resolveExitPromise!: () => void;

  protected _workerReadyPromise: Promise<void> | undefined;
  protected _resolveWorkerReady: (() => void) | undefined;

  public get state(): WorkerStates {
      throw new Error("STUB");
  }
  protected set state(value: WorkerStates) {
      throw new Error("STUB");
  }

  constructor(options: WorkerOptions) {
      throw new Error("STUB");
  }

  /**
   * Wait for the worker child process to be ready to handle requests.
   *
   * @returns Promise which resolves when ready.
   */
  public waitForWorkerReady(): Promise<void> {
    if (!this._workerReadyPromise) {
      this._workerReadyPromise = new Promise((resolve, reject) => {
          throw new Error("STUB");
      });
    }

    return this._workerReadyPromise;
  }

  /**
   * Used to shut down the current working instance once the children have been
   * killed off.
   */
  protected _shutdown(): void {
      throw new Error("STUB");
  }

  protected _getFakeStream(): PassThrough {
    if (!this._fakeStream) {
      this._fakeStream = new PassThrough();
    }
    return this._fakeStream;
  }
}
