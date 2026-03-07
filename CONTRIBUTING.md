# Contributing to Dictionaries+

Thank you for your interest in contributing to **Dictionaries+**!

## Getting Started

1. Fork the repository on GitHub, then clone your fork:

   ```bash
   git clone https://github.com/YOUR-USERNAME/dictplus.git
   cd dictplus
   npm install
   ```

2. Create a feature branch:

   ```bash
   git checkout -b feature/my-improvement
   ```

3. Make your changes to `src/01-core.js` and/or documentation.

4. Build and validate:

   ```bash
   npm run fullstack
   ```

5. Run the test suite:

   ```bash
   npm test
   ```

6. Open a pull request against `main`.

## Code Style

- All source code lives in `src/01-core.js`.
- Use ESLint and Prettier (already configured). Run `npm run format` before committing.
- Avoid mutating the prototype chain. Dangerous keys (`__proto__`, `constructor`, `prototype`) **must** remain blocked via `isDangerousKey`.
- New helper functions should follow the existing pattern of pure, named `const` functions defined before the `DictionariesPlus` class.

## Adding a New Block

1. Add a block descriptor inside `getInfo()` → `blocks` array (see existing blocks for examples).
2. Implement the corresponding method on `DictionariesPlus` (method name must match `opcode`).
3. Add a menu entry to `menus` if the block requires a dropdown.
4. Update `docs/example.md` with usage examples.
5. Update the blocks table in `README.md`.

## Testing

The project uses an automated test suite:

```bash
npm test
```

Please add or update tests whenever you change block behaviour.

## Commit Messages

Use short, descriptive messages in the imperative mood:

```text
Add filter-array block for nested key paths
Fix prototype-pollution guard in resolvePath
Update docs: array insertion examples
```

## Release Checklist

Before a release is tagged:

- [ ] Update `version` in `src/manifest.json`
- [ ] Run `npm run fullstack` — no errors
- [ ] Run `npm test` — all tests pass
- [ ] Update `docs/example.md` if behaviour changed
- [ ] Update block tables in `README.md` if blocks were added/removed

## Questions?

Open an issue or start a discussion on GitHub.
