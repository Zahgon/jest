/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class NotFoundPackageJsonError extends Error {
  constructor(rootDir: string) {
      throw new Error("STUB");
  }
}

export class MalformedPackageJsonError extends Error {
  constructor(packageJsonPath: string) {
      throw new Error("STUB");
  }
}
