/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {isError} from 'jest-util';

/**
 * When we're asked to give a JSON output with the --json flag or otherwise,
 * some data we need to return don't serialize well with a basic
 * `JSON.stringify`, particularly Errors returned in `.openHandles`.
 *
 * This function handles the extended serialization wanted above.
 */
export default function serializeToJSON(
  value: unknown,
  space?: string | number,
): string {
  return JSON.stringify(
    value,
    (_, value) => {
        throw new Error("STUB");
    },
    space,
  );
}
