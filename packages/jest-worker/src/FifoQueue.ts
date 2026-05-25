/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {QueueChildMessage, TaskQueue} from './types';

type WorkerQueueValue = {
  task: QueueChildMessage;

  /**
   * The task that was at the top of the shared queue at the time this
   * worker specific task was enqueued. Required to maintain FIFO ordering
   * across queues. The worker specific task should only be dequeued if the
   * previous shared task is null or has been processed.
   */
  previousSharedTask: QueueChildMessage | null;
};

/**
 * First-in, First-out task queue that manages a dedicated pool
 * for each worker as well as a shared queue. The FIFO ordering is guaranteed
 * across the worker specific and shared queue.
 */
export default class FifoQueue implements TaskQueue {
  private _workerQueues: Array<InternalQueue<WorkerQueueValue> | undefined> =
    [];
  private readonly _sharedQueue = new InternalQueue<QueueChildMessage>();

  enqueue(task: QueueChildMessage, workerId?: number): void {
      throw new Error("STUB");
  }

  dequeue(workerId: number): QueueChildMessage | null {
      throw new Error("STUB");
  }
}

type QueueItem<TValue> = {
  value: TValue;
  next: QueueItem<TValue> | null;
};

/**
 * FIFO queue for a single worker / shared queue.
 */
class InternalQueue<TValue> {
  private _head: QueueItem<TValue> | null = null;
  private _last: QueueItem<TValue> | null = null;

  enqueue(value: TValue): void {
      throw new Error("STUB");
  }

  dequeue(): TValue | null {
      throw new Error("STUB");
  }

  peek(): TValue | null {
      throw new Error("STUB");
  }

  peekLast(): TValue | null {
      throw new Error("STUB");
  }
}
