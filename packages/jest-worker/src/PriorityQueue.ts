/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {QueueChildMessage, TaskQueue} from './types';

export type ComputeTaskPriorityCallback = (
  method: string,
  ...args: Array<unknown>
) => number;

type QueueItem = {
  task: QueueChildMessage;
  priority: number;
};

/**
 * Priority queue that processes tasks in natural ordering (lower priority first)
 * according to the priority computed by the function passed in the constructor.
 *
 * FIFO ordering isn't guaranteed for tasks with the same priority.
 *
 * Worker specific tasks with the same priority as a non-worker specific task
 * are always processed first.
 */
export default class PriorityQueue implements TaskQueue {
  private _queue: Array<MinHeap<QueueItem>> = [];
  private readonly _sharedQueue = new MinHeap<QueueItem>();

  constructor(private readonly _computePriority: ComputeTaskPriorityCallback) {}

  enqueue(task: QueueChildMessage, workerId?: number): void {
      throw new Error("STUB");
  }

  _enqueue(task: QueueChildMessage, queue: MinHeap<QueueItem>): void {
      throw new Error("STUB");
  }

  dequeue(workerId: number): QueueChildMessage | null {
      throw new Error("STUB");
  }

  _getWorkerQueue(workerId: number): MinHeap<QueueItem> {
      throw new Error("STUB");
  }
}

type HeapItem = {
  priority: number;
};

class MinHeap<TItem extends HeapItem> {
  private readonly _heap: Array<TItem | null> = [];

  peek(): TItem | null {
      throw new Error("STUB");
  }

  add(item: TItem): void {
    const nodes = this._heap;
    nodes.push(item);

    if (nodes.length === 1) {
      return;
    }

    let currentIndex = nodes.length - 1;

    // Bubble up the added node as long as the parent is bigger
    while (currentIndex > 0) {
      const parentIndex = Math.floor((currentIndex + 1) / 2) - 1;
      const parent = nodes[parentIndex]!;

      if (parent.priority <= item.priority) {
        break;
      }

      nodes[currentIndex] = parent;
      nodes[parentIndex] = item;

      currentIndex = parentIndex;
    }
  }

  poll(): TItem | null {
      throw new Error("STUB");
  }
}
