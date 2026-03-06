# Dictionaries+

**Dictionaries+** is a TurboWarp/Scratch extension that brings the power of JSON to your projects. Store and manipulate structured data — nested objects, arrays, and more — directly inside your Scratch sprites using a rich set of blocks.

## Features

- **Dictionary Management**: Create, clone, merge, clear, and delete named dictionaries
- **Dot-Notation Key Paths**: Access deeply nested values with paths like `player.stats.hp`
- **Array Operations**: Push, insert, replace, delete, and join items in arrays stored inside dictionaries
- **Advanced Queries**: Filter arrays, aggregate numeric fields (sum/average/min/max), search for values, and find key paths
- **JSON Import/Export**: Load raw JSON into a dictionary; stringify or export as Base64
- **Type Inspection**: Check whether a value is an object, array, null, or a primitive
- **Prototype-Pollution Guard**: Dangerous keys (`__proto__`, `constructor`, `prototype`) are blocked at every access point

## Blocks Overview

### Reporters

| Block | Description |
|---|---|
| `list of dictionaries` | JSON array of all dictionary names |
| `stringify dictionary [DICT] into JSON` | Serialize a dictionary to a JSON string |
| `key [KEY] from dictionary [DICT]` | Read a value at a dot-notation path |
| `keys of path [KEY] in dictionary [DICT]` | List the keys of a nested object |
| `length of [KEY] in [DICT]` | Length of an array/string/object |
| `type of [KEY] in [DICT]` | `"object"`, `"array"`, `"string"`, `"number"`, etc. |
| `path to first [VAL] in [DICT]` | Dot-notation path to the first occurrence of a value |
| `filter array [KEY] in [DICT] where [SUBKEY] [OP] [VAL]` | Filter array of objects by a field comparison |
| `get [OP] of [KEY] in [DICT]` | Aggregate: sum / average / min / max |
| `flatten dictionary [DICT] to JSON` | Flatten nested keys to a single-level JSON object |
| `export dictionary [DICT] as Base64` | Base64-encode the JSON representation |
| `item [INDEX] of array [KEY] in [DICT]` | Get an array item by 0-based index |
| `items of array [KEY] in [DICT] joined by [SEP]` | Join all array items into a string |

### Booleans

| Block | Description |
|---|---|
| `is value [VAL] mentioned anywhere in [DICT]?` | Deep search for a value |
| `key [KEY] in [DICT] [CHECK]?` | Check: is defined / is null / is array / is dictionary (object) |

### Commands

| Block | Description |
|---|---|
| `key [KEY] in [DICT]: [ACTION] [VAL]` | set to / change by / push / delete a key |
| `dictionary [DICT]: [ACTION] [DATA]` | load JSON / clear / delete a dictionary |
| `clone dictionary [SRC] as [DEST]` | Deep-copy a dictionary under a new name |
| `merge dictionary [SRC] into [DEST]` | Deep-merge one dictionary into another |
| `initialize [DICT] as empty array` | Reset/create a dictionary as an empty array |
| `push [VAL] to array [KEY] in [DICT]` | Append a value to an array |
| `replace item [INDEX] of array [KEY] in [DICT] with [VAL]` | Replace an item at a 0-based index |
| `insert [VAL] at [INDEX] in array [KEY] in [DICT]` | Insert before a given index |
| `delete item [INDEX] from array [KEY] in [DICT]` | Remove an item by index |

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- TurboWarp or Scratch 3.0+ environment

### Installation

```bash
git clone https://github.com/kx1xixit/dictplus.git
cd dictplus
npm install
```

### Build

```bash
npm run build
```

This creates `build/extension.js`.

### Load in TurboWarp

1. Go to [turbowarp.org](https://turbowarp.org)
2. Click **Add Extension** → **Load Custom Extension**
3. Upload or paste the path to `build/extension.js`

## Development

| Command | Description |
|---|---|
| `npm run build` | Build once |
| `npm run watch` | Rebuild automatically on file changes |
| `npm run lint` | Check for code errors |
| `npm run format` | Auto-format code |
| `npm test` | Run automated tests |
| `npm run validate` | Validate the build output |
| `npm run fullstack` | Format + lint + spell-check + validate + build |

## Project Structure

```
src/
├── 01-core.js      ← All extension logic
└── manifest.json   ← Extension metadata (name, id, version, …)

build/
└── extension.js    ← Generated output (do not edit)

scripts/
└── build.js        ← Build script

docs/
└── example.md      ← Usage examples
```

## Usage Examples

See [docs/example.md](docs/example.md) for detailed examples covering:

- Basic dictionary read/write
- Nested key paths with dot notation
- Array operations (push, insert, filter, join)
- Combining arrays and objects
- Tips and edge cases

## Releases

A GitHub Actions workflow automatically builds and publishes a release when a version tag is pushed:

```bash
# Update version in src/manifest.json, then:
git tag v1.1.0
git push origin v1.1.0
```

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

KXEC-1.1 — see [LICENSE](LICENSE) for details.
