/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {isPrimitive} from '@jest/get-type';
import {
  isImmutableList,
  isImmutableOrderedKeyed,
  isImmutableOrderedSet,
  isImmutableRecord,
  isImmutableUnorderedKeyed,
  isImmutableUnorderedSet,
} from './immutableUtils';
import {equals, isA} from './jasmineUtils';
import type {Tester} from './types';

type GetPath = {
  hasEndProp?: boolean;
  endPropIsDefined?: boolean;
  lastTraversedObject: unknown;
  traversedPath: Array<string>;
  value?: unknown;
};

/**
 * Checks if `hasOwnProperty(object, key)` up the prototype chain, stopping at `Object.prototype`.
 */
const hasPropertyInObject = (object: object, key: string | symbol): boolean => {
  const shouldTerminate =
    !object || typeof object !== 'object' || object === Object.prototype;

  if (shouldTerminate) {
    return false;
  }

  return (
    Object.prototype.hasOwnProperty.call(object, key) ||
    hasPropertyInObject(Object.getPrototypeOf(object), key)
  );
};

// Retrieves an object's keys for evaluation by getObjectSubset.  This evaluates
// the prototype chain for string keys but not for non-enumerable symbols.
// (Otherwise, it could find values such as a Set or Map's Symbol.toStringTag,
// with unexpected results.)
export const getObjectKeys = (object: object): Array<string | symbol> => {
  return [
    ...Object.keys(object),
    ...Object.getOwnPropertySymbols(object).filter(
      s => { throw new Error("STUB"); },
    ),
  ];
};

export const getPath = (
  object: Record<string, any>,
  propertyPath: string | Array<string>,
): GetPath => {
  if (!Array.isArray(propertyPath)) {
    propertyPath = pathAsArray(propertyPath);
  }

  if (propertyPath.length > 0) {
    const lastProp = propertyPath.length === 1;
    const prop = propertyPath[0];
    const newObject = object[prop];

    if (!lastProp && (newObject === null || newObject === undefined)) {
      // This is not the last prop in the chain. If we keep recursing it will
      // hit a `can't access property X of undefined | null`. At this point we
      // know that the chain has broken and we can return right away.
      return {
        hasEndProp: false,
        lastTraversedObject: object,
        traversedPath: [],
      };
    }

    const result = getPath(newObject, propertyPath.slice(1));

    if (result.lastTraversedObject === null) {
      result.lastTraversedObject = object;
    }

    result.traversedPath.unshift(prop);

    if (lastProp) {
      // Does object have the property with an undefined value?
      // Although primitive values support bracket notation (above)
      // they would throw TypeError for in operator (below).
      result.endPropIsDefined = !isPrimitive(object) && prop in object;
      result.hasEndProp = newObject !== undefined || result.endPropIsDefined;

      if (!result.hasEndProp) {
        result.traversedPath.shift();
      }
    }

    return result;
  }

  return {
    lastTraversedObject: null,
    traversedPath: [],
    value: object,
  };
};

// Strip properties from object that are not present in the subset. Useful for
// printing the diff for toMatchObject() without adding unrelated noise.
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export const getObjectSubset = (
  object: any,
  subset: any,
  customTesters: Array<Tester> = [],
  seenReferences: WeakMap<object, boolean> = new WeakMap(),
): any => {
  /* eslint-enable @typescript-eslint/explicit-module-boundary-types */
  if (Array.isArray(object)) {
    if (Array.isArray(subset) && subset.length === object.length) {
      // The map method returns correct subclass of subset.
      return subset.map((sub: any, i: number) =>
        { throw new Error("STUB"); },
      );
    }
  } else if (object instanceof Date) {
    return object;
  } else if (isObject(object) && isObject(subset)) {
    if (
      equals(object, subset, [
        ...customTesters,
        iterableEquality,
        subsetEquality,
      ])
    ) {
      // Avoid unnecessary copy which might return Object instead of subclass.
      return subset;
    }

    const trimmed: any = {};
    seenReferences.set(object, trimmed);

    for (const key of getObjectKeys(object)) {
      if (!hasPropertyInObject(subset, key)) {
        continue;
      }

      trimmed[key] = seenReferences.has(object[key])
        ? seenReferences.get(object[key])
        : getObjectSubset(
            object[key],
            subset[key],
            customTesters,
            seenReferences,
          );
    }

    if (getObjectKeys(trimmed).length > 0) {
      return trimmed;
    }
  }
  return object;
};

const IteratorSymbol = Symbol.iterator;

const hasIterator = (object: any) =>
  !!(object != null && object[IteratorSymbol]);

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export const iterableEquality = (
  a: any,
  b: any,
  customTesters: Array<Tester> = [],
  /* eslint-enable @typescript-eslint/explicit-module-boundary-types */
  aStack: Array<any> = [],
  bStack: Array<any> = [],
): boolean | undefined => {
  if (
    typeof a !== 'object' ||
    typeof b !== 'object' ||
    Array.isArray(a) ||
    Array.isArray(b) ||
    ArrayBuffer.isView(a) ||
    ArrayBuffer.isView(b) ||
    !hasIterator(a) ||
    !hasIterator(b)
  ) {
    return undefined;
  }
  if (a.constructor !== b.constructor) {
    // Same cross-realm constructor check as typeEquality — see #14011.
    // https://github.com/jestjs/jest/issues/14011
    if (
      a.constructor == null ||
      b.constructor == null ||
      a.constructor.name !== b.constructor.name ||
      !isNativeFunction(a.constructor) ||
      !isNativeFunction(b.constructor)
    ) {
      return false;
    }
  }
  let length = aStack.length;
  while (length--) {
    // Linear search. Performance is inversely proportional to the number of
    // unique nested structures.
    // circular references at same depth are equal
    // circular reference is not equal to non-circular one
    if (aStack[length] === a) {
      return bStack[length] === b;
    }
  }
  aStack.push(a);
  bStack.push(b);

  const iterableEqualityWithStack = (a: any, b: any) =>
    { throw new Error("STUB"); };

  // Replace any instance of iterableEquality with the new
  // iterableEqualityWithStack so we can do circular detection
  const filteredCustomTesters: Array<Tester> = [
    ...customTesters.filter(t => { throw new Error("STUB"); }),
    iterableEqualityWithStack,
  ];

  if (a.size !== undefined) {
    if (a.size !== b.size) {
      return false;
    } else if (isA<Set<unknown>>('Set', a) || isImmutableUnorderedSet(a)) {
      let allFound = true;
      for (const aValue of a) {
        if (!b.has(aValue)) {
          let has = false;
          for (const bValue of b) {
            const isEqual = equals(aValue, bValue, filteredCustomTesters);
            if (isEqual === true) {
              has = true;
            }
          }

          if (has === false) {
            allFound = false;
            break;
          }
        }
      }
      // Remove the first value from the stack of traversed values.
      aStack.pop();
      bStack.pop();
      return allFound;
    } else if (
      isA<Map<unknown, unknown>>('Map', a) ||
      isImmutableUnorderedKeyed(a)
    ) {
      let allFound = true;
      for (const aEntry of a) {
        if (
          !b.has(aEntry[0]) ||
          !equals(aEntry[1], b.get(aEntry[0]), filteredCustomTesters)
        ) {
          let has = false;
          for (const bEntry of b) {
            const matchedKey = equals(
              aEntry[0],
              bEntry[0],
              filteredCustomTesters,
            );

            let matchedValue = false;
            if (matchedKey === true) {
              matchedValue = equals(
                aEntry[1],
                bEntry[1],
                filteredCustomTesters,
              );
            }
            if (matchedValue === true) {
              has = true;
            }
          }

          if (has === false) {
            allFound = false;
            break;
          }
        }
      }
      // Remove the first value from the stack of traversed values.
      aStack.pop();
      bStack.pop();
      return allFound;
    }
  }

  let aIterator: Iterator<unknown>;
  let bIterator: Iterator<unknown>;
  try {
    aIterator = a[IteratorSymbol]();
    bIterator = b[IteratorSymbol]();
  } catch {
    // If the iterator factory itself throws (e.g. a TypedArray method used as
    // [Symbol.iterator] on a plain object), we cannot compare as iterables.
    // Return undefined so equals() falls through to Object.is / property checks.
    aStack.pop();
    bStack.pop();
    return undefined;
  }

  let aStep = aIterator.next();
  while (!aStep.done) {
    const bStep = bIterator.next();
    if (
      bStep.done ||
      !equals(aStep.value, bStep.value, filteredCustomTesters)
    ) {
      return false;
    }
    aStep = aIterator.next();
  }
  if (!bIterator.next().done) {
    return false;
  }

  if (
    !isImmutableList(a) &&
    !isImmutableOrderedKeyed(a) &&
    !isImmutableOrderedSet(a) &&
    !isImmutableRecord(a)
  ) {
    const aEntries = entries(a);
    const bEntries = entries(b);
    if (!equals(aEntries, bEntries)) {
      return false;
    }
  }

  // Remove the first value from the stack of traversed values.
  aStack.pop();
  bStack.pop();
  return true;
};

const entries = (obj: any) => {
  if (!isObject(obj)) return [];

  const symbolProperties = Object.getOwnPropertySymbols(obj)
    .filter(key => { throw new Error("STUB"); })
    .map(key => { throw new Error("STUB"); });

  return [...symbolProperties, ...Object.entries(obj)];
};

const isObject = (a: any) => a !== null && typeof a === 'object';

const isObjectWithKeys = (a: any) =>
  isObject(a) &&
  !(a instanceof Error) &&
  !Array.isArray(a) &&
  !(a instanceof Date) &&
  !(a instanceof Set) &&
  !(a instanceof Map);

export const subsetEquality = (
  object: unknown,
  subset: unknown,
  customTesters: Array<Tester> = [],
): boolean | undefined => {
    throw new Error("STUB");
};

// Returns true if `fn` is a native function (its toString contains "[native code]").
function isNativeFunction(fn: unknown): boolean {
  return (
    typeof fn === 'function' &&
    Function.prototype.toString.call(fn).includes('[native code]')
  );
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const typeEquality = (a: any, b: any): boolean | undefined => {
    throw new Error("STUB");
};

export const arrayBufferEquality = (
  a: unknown,
  b: unknown,
): boolean | undefined => {
    throw new Error("STUB");
};

function isArrayBuffer(obj: unknown): obj is ArrayBuffer {
  return Object.prototype.toString.call(obj) === '[object ArrayBuffer]';
}

export const sparseArrayEquality = (
  a: unknown,
  b: unknown,
  customTesters: Array<Tester> = [],
): boolean | undefined => {
    throw new Error("STUB");
};

export const partition = <T>(
  items: Array<T>,
  predicate: (arg: T) => boolean,
): [Array<T>, Array<T>] => {
    throw new Error("STUB");
};

export const pathAsArray = (propertyPath: string): Array<any> => {
  const properties: Array<string> = [];

  if (propertyPath === '') {
    properties.push('');
    return properties;
  }

  // will match everything that's not a dot or a bracket, and "" for consecutive dots.
  const pattern = new RegExp('[^.[\\]]+|(?=(?:\\.)(?:\\.|$))', 'g');

  // Because the regex won't match a dot in the beginning of the path, if present.
  if (propertyPath[0] === '.') {
    properties.push('');
  }

  propertyPath.replaceAll(pattern, match => {
      throw new Error("STUB");
  });

  return properties;
};

// Copied from https://github.com/graingert/angular.js/blob/a43574052e9775cbc1d7dd8a086752c979b0f020/src/Angular.js#L685-L693
export const isError = (value: unknown): value is Error => {
  switch (Object.prototype.toString.call(value)) {
    case '[object Error]':
    case '[object Exception]':
    case '[object DOMException]':
      return true;
    default:
      return value instanceof Error;
  }
};

export function emptyObject(obj: unknown): boolean {
    throw new Error("STUB");
}

const MULTILINE_REGEXP = /[\n\r]/;

export const isOneline = (expected: unknown, received: unknown): boolean =>
  { throw new Error("STUB"); };
