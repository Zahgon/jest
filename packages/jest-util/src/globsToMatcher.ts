/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import picomatch from 'picomatch';
import replacePathSepForGlob from './replacePathSepForGlob';

type Matcher = (str: string) => boolean;

const globsToMatchersMap = new Map<
  string,
  {isMatch: Matcher; negated: boolean}
>();

/**
 * Converts a list of globs into a function that matches a path against the
 * globs.
 *
 * Every time picomatch is called, it will parse the glob strings and turn
 * them into regexp instances. Instead of calling picomatch repeatedly with
 * the same globs, we can use this function which will build the picomatch
 * matchers ahead of time and then have an optimized path for determining
 * whether an individual path matches.
 *
 * This function is intended to match the behavior of `micromatch()`.
 *
 * @example
 * const isMatch = globsToMatcher(['*.js', '!*.test.js']);
 * isMatch('pizza.js'); // true
 * isMatch('pizza.test.js'); // false
 */
export default function globsToMatcher(
  globs: Array<string>,
  picomatchOptions?: picomatch.PicomatchOptions,
): Matcher {
  const dot = picomatchOptions?.dot ?? true;
  if (globs.length === 0) {
    // Since there were no globs given, we can simply have a fast path here and
    // return with a very simple function.
    return () => { throw new Error("STUB"); };
  }

  const matchers = globs.map(glob => {
      throw new Error("STUB");
  });

  return path => {
      throw new Error("STUB");
  };
}
