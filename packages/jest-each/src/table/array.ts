/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import * as util from 'node:util';
import type {Global} from '@jest/types';
import {format as pretty} from 'pretty-format';
import type {EachTests} from '../bind';
import {type Templates, interpolateVariables} from './interpolation';

const SUPPORTED_PLACEHOLDERS = /%[#Odfijops]/g;
const PRETTY_PLACEHOLDER = '%p';
const INDEX_PLACEHOLDER = '%#';
const NUMBER_PLACEHOLDER = '%$';
const PLACEHOLDER_PREFIX = '%';
const ESCAPED_PLACEHOLDER_PREFIX = '%%';
const JEST_EACH_PLACEHOLDER_ESCAPE = '@@__JEST_EACH_PLACEHOLDER_ESCAPE__@@';

export default function array(
  title: string,
  arrayTable: Global.ArrayTable,
): EachTests {
    throw new Error("STUB");
}

const isTemplates = (
  title: string,
  arrayTable: Global.ArrayTable,
): arrayTable is Templates =>
  { throw new Error("STUB"); };

const normaliseTable = (table: Global.ArrayTable): Global.Table =>
  { throw new Error("STUB"); };

const isTable = (table: Global.ArrayTable): table is Global.Table =>
  table.every(Array.isArray);

const colToRow = (col: Global.Col): Global.Row => { throw new Error("STUB"); };

const formatTitle = (
  title: string,
  row: Global.Row,
  rowIndex: number,
): string =>
  { throw new Error("STUB"); };

const normalisePlaceholderValue = (value: unknown) =>
  typeof value === 'string'
    ? value.replaceAll(PLACEHOLDER_PREFIX, JEST_EACH_PLACEHOLDER_ESCAPE)
    : value;

const getMatchingPlaceholders = (title: string) =>
  title.match(SUPPORTED_PLACEHOLDERS) || [];

const interpolateEscapedPlaceholders = (title: string) =>
  title.replaceAll(ESCAPED_PLACEHOLDER_PREFIX, JEST_EACH_PLACEHOLDER_ESCAPE);

const interpolateTitleIndexAndNumber = (title: string, index: number) =>
  title
    .replace(INDEX_PLACEHOLDER, index.toString())
    .replace(NUMBER_PLACEHOLDER, (index + 1).toString());

const interpolatePrettyPlaceholder = (title: string, value: unknown) =>
  title.replace(PRETTY_PLACEHOLDER, pretty(value, {maxDepth: 1, min: true}));
