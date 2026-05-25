/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type Suite from './jasmine/Suite';

type Options = {
  nodeComplete: (suite: TreeNode) => void;
  nodeStart: (suite: TreeNode) => void;
  queueRunnerFactory: any;
  runnableIds: Array<string>;
  tree: TreeNode;
};

export type TreeNode = {
  afterAllFns: Array<unknown>;
  beforeAllFns: Array<unknown>;
  disabled?: boolean;
  execute: (onComplete: () => void, enabled: boolean) => void;
  id: string;
  onException: (error: Error) => void;
  sharedUserContext: () => unknown;
  children?: Array<TreeNode>;
} & Pick<Suite, 'getResult' | 'parentSuite' | 'result' | 'markedPending'>;

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {
    throw new Error("STUB");
};

function getNodeWithoutChildrenHandler(node: TreeNode, enabled: boolean) {
    throw new Error("STUB");
}

function hasNoEnabledTest(node: TreeNode): boolean {
    throw new Error("STUB");
}

export default function treeProcessor(options: Options): void {
    throw new Error("STUB");
}
