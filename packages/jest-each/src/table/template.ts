/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {Global} from '@jest/types';
import type {EachTests} from '../bind';
import {
  type Headings,
  type Templates,
  interpolateVariables,
} from './interpolation';

export default function template(
  title: string,
  headings: Headings,
  row: Global.Row,
): EachTests {
    throw new Error("STUB");
}

const convertRowToTable = (row: Global.Row, headings: Headings): Global.Table =>
  { throw new Error("STUB"); };

const convertTableToTemplates = (
  table: Global.Table,
  headings: Headings,
): Templates =>
  { throw new Error("STUB"); };
