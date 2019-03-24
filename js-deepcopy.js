// the classic way to deepcopy is JSON.parse(JSON.stringify(thing)),
// but has some issues like losing references, losing some types,
// and being slow as everything is converted to a string representation and back.
//
// this is an attempt to bypass that with a faster method,
// but still doesn't work with all classes.

function deepCopy(thing, refs) {
  refs = refs || new WeakMap() // handles cyclic references

  if (typeof thing === 'function') // not much we can do with functions
    return thing

  if (Object(thing) !== thing) // things already passed by value / primitives
    return thing

  if (refs.has(thing))
    return refs.get(thing)

  if (thing instanceof WeakMap || thing instanceof WeakSet)
    throw new TypeError('Cannot copy objects of type WeakMap/WeakSet')

  if (thing instanceof Set) {
    const copy = new Set()
    refs.set(thing, copy)
    thing.forEach(x => deepCopy(x, refs))
    return copy
  }

  let copy
  if (isTypedArray(thing))
    copy = new thing.constructor(thing.length)
  else if (thing instanceof Date)
    copy = new Date(thing)
  else if (thing instanceof RegExp)
    copy = new RegExp(thing.source, thing.flags)
  else {
    copy = thing.constructor ? new thing.constructor : {}
    refs.set(thing, copy)
    if (thing instanceof Map)
      for (const [key, val] of thing.entries())
        copy.set(key, deepCopy(val, refs))
  }

  refs.set(thing, copy)
  for (const key of Object.keys(thing))
    copy[key] = deepCopy(thing[key], refs)

  return copy
}

function isTypedArray(thing) {
  for (const type of [
      Int8Array,
      Uint8Array,
      Uint8ClampedArray,
      Int16Array,
      Uint16Array,
      Int32Array,
      Uint32Array,
      Float32Array,
      Float64Array
    ])
    if (thing instanceof type)
      return true
}
