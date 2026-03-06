# Quick Start — Dictionaries+

Get up and running with the **Dictionaries+** TurboWarp extension in 5 minutes.

## Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- TurboWarp ([Link](https://turbowarp.org/)) or Scratch 3.0+

## Setup

```bash
# 1. Clone the repository
git clone https://github.com/kx1xixit/dictplus.git
cd dictplus

# 2. Install dependencies
npm install

# 3. Build the extension
npm run build
```

## Load in TurboWarp

1. Go to [turbowarp.org](https://turbowarp.org)
2. Click **Add Extension** → **Load Custom Extension**
3. Upload `build/extension.js`
4. The **Dictionaries+** block category will appear in the editor

## Basic Usage

### Create a dictionary and set a value

```
dictionary [player]: load JSON {"name": "Alice", "score": 0}
key [score] in [player]: set to [42]
```

### Read a value

```
key [score] from dictionary [player]   → 42
```

### Nested keys (dot notation)

```
dictionary [game]: load JSON {"player": {"hp": 100}}
key [player.hp] from dictionary [game]   → 100
```

### Arrays

```
initialize [scores] as empty array
push [10] to array [] in [scores]
push [20] to array [] in [scores]
item [0] of array [] in [scores]         → 10
items of array [] in [scores] joined by [, ]  → "10, 20"
```

## Development Workflow

| Command | Description |
|---|---|
| `npm run build` | Build once |
| `npm run watch` | Rebuild automatically on file changes |
| `npm run lint` | Check for code errors |
| `npm run format` | Auto-format code |
| `npm test` | Run automated tests |

## Publishing a Release

```bash
# Update version in src/manifest.json, then:
git tag v1.1.0
git push origin main --tags
```

→ GitHub Actions will automatically create a release with `build/extension.js` as an asset.

## Need Help?

- Full documentation: [README.md](README.md)
- Usage examples: [docs/example.md](docs/example.md)
- Contributing: [CONTRIBUTING.md](CONTRIBUTING.md)
- Issues: [Create an issue](../../issues/new)
