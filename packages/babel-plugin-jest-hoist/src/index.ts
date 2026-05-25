/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {PluginObj} from '@babel/core';
import type {NodePath} from '@babel/traverse';
import type {
  CallExpression,
  Expression,
  Identifier,
  ImportDeclaration,
  MemberExpression,
  Node,
  Statement,
  StringLiteral,
  Super,
  VariableDeclaration,
  VariableDeclarator,
} from '@babel/types';

const JEST_GLOBAL_NAME = 'jest';
const JEST_GLOBALS_MODULE_NAME = '@jest/globals';
const JEST_GLOBALS_MODULE_JEST_EXPORT_NAME = 'jest';

const hoistedVariables = new WeakSet<VariableDeclarator>();
const hoistedJestGetters = new WeakSet<CallExpression>();
const hoistedJestExpressions = new WeakSet<Expression>();

// We allow `jest`, `expect`, `require`, all default Node.js globals and all
// ES2015 built-ins to be used inside of a `jest.mock` factory.
// We also allow variables prefixed with `mock` as an escape-hatch.
const ALLOWED_IDENTIFIERS = new Set<string>(
  [
    'Array',
    'ArrayBuffer',
    'Boolean',
    'BigInt',
    'DataView',
    'Date',
    'Error',
    'EvalError',
    'Float32Array',
    'Float64Array',
    'Function',
    'Generator',
    'GeneratorFunction',
    'Infinity',
    'Int16Array',
    'Int32Array',
    'Int8Array',
    'InternalError',
    'Intl',
    'JSON',
    'Map',
    'Math',
    'NaN',
    'Number',
    'Object',
    'Promise',
    'Proxy',
    'RangeError',
    'ReferenceError',
    'Reflect',
    'RegExp',
    'Set',
    'String',
    'Symbol',
    'SyntaxError',
    'TypeError',
    'URIError',
    'Uint16Array',
    'Uint32Array',
    'Uint8Array',
    'Uint8ClampedArray',
    'WeakMap',
    'WeakSet',
    'arguments',
    'console',
    'expect',
    'isNaN',
    'jest',
    'parseFloat',
    'parseInt',
    'exports',
    'require',
    'module',
    '__filename',
    '__dirname',
    'undefined',
    ...Object.getOwnPropertyNames(globalThis),
  ].sort(),
);

const IDVisitor = {
  ReferencedIdentifier(
    path: NodePath<Identifier>,
    {ids}: {ids: Set<NodePath<Identifier>>},
  ) {
        throw new Error("STUB");
    },
  denylist: [
    'TypeAnnotation',
    'TSTypeAnnotation',
    'TSTypeQuery',
    'TSTypeReference',
  ],
};

const FUNCTIONS = Object.create(null) as Record<
  string,
  <T extends Node>(args: Array<NodePath<T>>) => boolean
>;

FUNCTIONS.mock = args => {
    throw new Error("STUB");
};

FUNCTIONS.unmock = args => { throw new Error("STUB"); };
FUNCTIONS.deepUnmock = args => { throw new Error("STUB"); };
FUNCTIONS.disableAutomock = FUNCTIONS.enableAutomock = args =>
  { throw new Error("STUB"); };

const isJestObject = (
  expression: NodePath<Expression | Super>,
): expression is NodePath<Identifier | MemberExpression> => {
  // global
  if (
    expression.isIdentifier() &&
    expression.node.name === JEST_GLOBAL_NAME &&
    !expression.scope.hasBinding(JEST_GLOBAL_NAME)
  ) {
    return true;
  }
  // import { jest } from '@jest/globals'
  if (
    expression.referencesImport(
      JEST_GLOBALS_MODULE_NAME,
      JEST_GLOBALS_MODULE_JEST_EXPORT_NAME,
    )
  ) {
    return true;
  }
  // import * as JestGlobals from '@jest/globals'
  if (
    expression.isMemberExpression() &&
    !expression.node.computed &&
    expression
      .get<'object'>('object')
      .referencesImport(JEST_GLOBALS_MODULE_NAME, '*') &&
    expression.node.property.type === 'Identifier' &&
    expression.node.property.name === JEST_GLOBALS_MODULE_JEST_EXPORT_NAME
  ) {
    return true;
  }

  return false;
};

type JestObjInfo = {
  hoist: boolean;
  path: NodePath<Expression>;
};

const extractJestObjExprIfHoistable = (expr: NodePath): JestObjInfo | null => {
  if (!expr.isCallExpression()) {
    return null;
  }

  const callee = expr.get<'callee'>('callee');
  const args = expr.get<'arguments'>('arguments');

  if (!callee.isMemberExpression() || callee.node.computed) {
    return null;
  }

  const object = callee.get<'object'>('object');
  const property = callee.get<'property'>('property') as NodePath<Identifier>;
  const propertyName = property.node.name;

  const jestObjExpr = isJestObject(object)
    ? object
    : // The Jest object could be returned from another call since the functions are all chainable.
      extractJestObjExprIfHoistable(object)?.path;
  if (!jestObjExpr) {
    return null;
  }

  // Important: Call the function check last
  // It might throw an error to display to the user,
  // which should only happen if we're already sure it's a call on the Jest object.
  const functionIsHoistable = FUNCTIONS[propertyName]?.(args) ?? false;
  let functionHasHoistableScope = functionIsHoistable;
  for (
    let path: NodePath<Node> | null = expr;
    path && !functionHasHoistableScope;
    path = path.parentPath
  ) {
    functionHasHoistableScope = hoistedJestExpressions.has(
      // @ts-expect-error: it's ok if path.node is not an Expression, .has will
      // just return false.
      path.node,
    );
  }

  if (functionHasHoistableScope) {
    hoistedJestExpressions.add(expr.node);
    return {
      hoist: functionIsHoistable,
      path: jestObjExpr,
    };
  }

  return null;
};

/* eslint-disable sort-keys */
export default function jestHoist(
  babel: typeof import('@babel/core'),
): PluginObj<{
  declareJestObjGetterIdentifier: () => Identifier;
  jestObjGetterIdentifier?: Identifier;
}> {
    throw new Error("STUB");
}
/* eslint-enable */
