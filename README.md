# canvas-transform

This provides an implementation of `getTransform` for Canvas contexts and
exposes much of the underlying implementation so that it can be plugged into
other context wrappers.

# Install

With [npm](http://npmjs.org) installed, run

```
npm install canvas-transform
```

# API

``` js
var Transform = require("canvas-transform");
```

The type `TransformMatrix` used in this API documentation is a six element
array `[a, b, c, d, e, f]` representing the 3 by 3 matrix
```
a c e
b d f
0 0 1
```

## `Transform.translate(x, y) -> TransformMatrix`

Returns the matrix to multiply by when a context's translate method is called.

## `Transform.rotate(angle) -> TransformMatrix`

Returns the matrix to multiply by when a context's rotate method is called.

## `Transform.scale(x, y) -> TransformMatrix`

Returns the matrix to multiply by when a context's scale method is called.

## `Transform.transform(a, b, c, d, e, f) -> TransformMatrix`

Returns the matrix to multiply by when a context's transform method is called.

## `Transform.multiply(m1, m2) -> TransformMatrix`

Returns the result of multiplying `m1` and `m2` as 3 by 3 matrices. Each of `m1`
and `m2` should be a `TransformMatrix`.

## `Transform.process(m, methodName, args) -> TransformMatrix`

Returns the result of multiplying `m`, specified as a `TransformMatrix`, by the
transformation matrix that results from applying the Canvas method with name
`methodName` and arguments `args`. The supported `methodName` values are
`translate`, `rotate`, `scale`, `transform`, `setTransform`, and
`resetTransform`. Providing an invalid `methodName` will return `m` unchanged.
The arguments to the method, `args`, can be either an array or array-like
object.

As an example,
```Transform.process([1, 0, 0, 1, 0, 0], "translate", [10, 20])```
is equivalent to `Transform.translate(10, 20)`.

## `Transform.augmentContext(context)`

Pass in a Canvas context, and a `getTransform` method will be added to it if
it does not already exist. `getTransform` returns a `TransformMatrix`.

This method will also add `resetTransform` to the context if it does not exist,
implemented by calling `setTransform(1, 0, 0, 1, 0, 0)`.

# Test

With [npm](http://npmjs.org) installed, run

```
npm test
```

To lint with [ESLint](http://eslint.org/), run

```
npm run check
```

# License

MIT
