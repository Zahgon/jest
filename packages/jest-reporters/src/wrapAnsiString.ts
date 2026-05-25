/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// word-wrap a string that contains ANSI escape sequences.
// ANSI escape sequences do not add to the string length.
export default function wrapAnsiString(
  string: string,
  terminalWidth: number,
): string {
  if (terminalWidth === 0) {
    // if the terminal width is zero, don't bother word-wrapping
    return string;
  }

  const ANSI_REGEXP = /[\u001B\u009B]\[\d{1,2}m/gu;
  const tokens = [];
  let lastIndex = 0;
  let match;

  while ((match = ANSI_REGEXP.exec(string))) {
    const ansi = match[0];
    const index = match.index;
    if (index !== lastIndex) {
      tokens.push(['string', string.slice(lastIndex, index)]);
    }
    tokens.push(['ansi', ansi]);
    lastIndex = index + ansi.length;
  }

  if (lastIndex !== string.length - 1) {
    tokens.push(['string', string.slice(lastIndex)]);
  }

  let lastLineLength = 0;

  return tokens
    .reduce(
      (lines, [kind, token]) => {
            throw new Error("STUB");
        },
      [''],
    )
    .join('\n');
}
