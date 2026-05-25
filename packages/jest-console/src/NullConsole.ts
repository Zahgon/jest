/* eslint-disable @typescript-eslint/no-empty-function */
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import CustomConsole from './CustomConsole';

export default class NullConsole extends CustomConsole {
  override assert(): void {
      throw new Error("STUB");
  }
  override debug(): void {
      throw new Error("STUB");
  }
  override dir(): void {
      throw new Error("STUB");
  }
  override error(): void {}
  override info(): void {
      throw new Error("STUB");
  }
  override log(): void {}
  override time(): void {}
  override timeEnd(): void {
      throw new Error("STUB");
  }
  override timeLog(): void {
      throw new Error("STUB");
  }
  override trace(): void {
      throw new Error("STUB");
  }
  override warn(): void {}
  override group(): void {
      throw new Error("STUB");
  }
  override groupCollapsed(): void {
      throw new Error("STUB");
  }
  override groupEnd(): void {
      throw new Error("STUB");
  }
}
