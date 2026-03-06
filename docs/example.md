# Dictionaries+ Documentation

**Dictionaries+** brings the power of JSON to your Scratch/TurboWarp projects. You can store structured data (objects, nested objects, and arrays) and query or modify it using blocks.

---

## Basic Dictionary Usage

A *dictionary* is a named store that holds a JSON value (object or array). You can create one by loading JSON data or by setting keys.

**Create a dictionary and set values:**

1. Use `dictionary [foo]: load JSON {"score": 0, "name": "Alice"}` to load a JSON object.
2. Use `key [score] in [foo]: set to [42]` to update a value.
3. Use `key [score] from dictionary [foo]` (reporter) to read a value.

**Nested keys** use dot notation. For example, the key `player.stats.hp` refers to `root.player.stats.hp`.

---

## Using Dictionaries as Arrays

A dictionary can also store a **root-level array** (e.g. `[1, 2, 3]`) instead of an object. This is useful for ordered lists.

### Dedicated Array Blocks

The **Array Operations** section provides blocks that make working with arrays straightforward.

#### Initialize an array

```text
initialize [myArray] as empty array
```

Creates a new (or resets an existing) dictionary as an empty array `[]`.

#### Push (append) a value

```text
push [item] to array [] in [myArray]
```

Appends a value to the root-level array. Leave the `KEY` field empty to target the root array.

To push to a nested array inside a dictionary, supply the key path:

```text
push [42] to array [scores] in [foo]
```

When the dictionary itself is a root-level array (e.g. `[{"scores": []}]`), use an index-prefixed path to address a field inside an element. The leading number is the element index:

```text
push [42] to array [0.scores] in [myArray]
```

The `0` selects the first element of the root array, and `scores` is the nested array inside it.

#### Read an item by index (0-based)

```text
item [0] of array [] in [myArray]
```

Returns the item at the given index (0 = first item). Leave `KEY` empty for the root array, or provide a key path for a nested array.

#### Replace an item

```text
replace item [0] of array [] in [myArray] with [newValue]
```

Replaces the value at the specified index.

#### Insert at a specific position

```text
insert [item] at [0] in array [] in [myArray]
```

Inserts a value *before* the given index, shifting later items forward.

#### Delete an item

```text
delete item [0] from array [] in [myArray]
```

Removes the item at the specified index and shifts later items back.

#### Join all items as a string

```text
items of array [] in [myArray] joined by [, ]
```

Returns all array elements as a single string separated by the given separator. Useful for displaying list contents in a say block.

---

## Loading Arrays with "load JSON"

You can also load a JSON array directly using the generic dictionary block:

```text
dictionary [myArray]: load JSON [1, 2, 3]
```

After loading, use the array blocks above to read and modify items.

---

## Array + Dictionary Together

Arrays and objects can be nested freely. For example, load this JSON into dictionary `data`:

```json
{"users": [{"name": "Alice", "score": 10}, {"name": "Bob", "score": 20}]}
```

Then use `filter array [users] in [data] where [score] [>] [15]` to get all users with a score above 15.

Use `item [0] of array [users] in [data]` to read the first user object.

---

## Tips

- All array indices are **0-based** (first item is index 0).
- Leave the `KEY` argument blank to operate on the dictionary's root-level array.
- Accessing an index that is out of bounds returns `undefined`.
- `replace item` and `delete item` do nothing when the index is out of bounds.
- `insert` clamps to the array length, so inserting at an index beyond the last element appends to the end.
- Use `stringify dictionary [DICT] into JSON` to inspect the full contents of a dictionary at any time.
- Use `type of [] in [DICT]` (leave key blank) to check whether the root is an `array` or `object`.

