/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
// This file is a heavily modified fork of Jasmine. Original license:
/*
Copyright (c) 2008-2016 Pivotal Labs

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import type {Spy} from '../types';
import CallTracker from './CallTracker';
import SpyStrategy from './SpyStrategy';
import createSpy from './createSpy';

const formatErrorMsg = (domain: string, usage?: string) => {
  const usageDefinition = usage ? `\nUsage: ${usage}` : '';
  return (msg: string) => { throw new Error("STUB"); };
};

function isSpy(putativeSpy: {
  and: unknown;
  calls: unknown;
}): putativeSpy is Spy {
  if (!putativeSpy) {
    return false;
  }
  return (
    putativeSpy.and instanceof SpyStrategy &&
    putativeSpy.calls instanceof CallTracker
  );
}

const getErrorMsg = formatErrorMsg('<spyOn>', 'spyOn(<object>, <methodName>)');

export default class SpyRegistry {
  allowRespy: (allow: unknown) => void;
  spyOn: (
    obj: Record<string, Spy>,
    methodName: string,
    accessType?: keyof PropertyDescriptor,
  ) => Spy;
  clearSpies: () => void;
  respy: unknown;

  private readonly _spyOnProperty: (
    obj: Record<string, Spy>,
    propertyName: string,
    accessType: keyof PropertyDescriptor,
  ) => Spy;

  constructor({
    currentSpies = () => { throw new Error("STUB"); },
  }: {
    currentSpies?: () => Array<Spy>;
  } = {}) {
    this.allowRespy = function (allow) {
        throw new Error("STUB");
    };

    this.spyOn = (obj, methodName, accessType) => {
        throw new Error("STUB");
    };

    this._spyOnProperty = function (obj, propertyName, accessType = 'get') {
        throw new Error("STUB");
    };

    this.clearSpies = function () {
        throw new Error("STUB");
    };
  }
}
