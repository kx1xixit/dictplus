#!/usr/bin/env node
/**
 * Runtime test for the built extension.
 * Uses createRequire to load build/extension.js as CommonJS so top-level
 * runtime errors (e.g. bare require calls, reference errors) are caught.
 * Also reports bundle size and block count.
 */

import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const BUILD_FILE = path.join(__dirname, '../build/extension.js');

// Provide a minimal Scratch stub so the extension IIFE can register
let registeredExtension = null;
globalThis.Scratch = {
  extensions: {
    register: ext => {
      registeredExtension = ext;
    },
  },
  translate: str => str,
  BlockType: {
    REPORTER: 'reporter',
    COMMAND: 'command',
    BOOLEAN: 'boolean',
  },
  ArgumentType: {
    STRING: 'string',
    NUMBER: 'number',
    BOOLEAN: 'boolean',
  },
};

require(BUILD_FILE);
console.log('Runtime check passed.');

// Report bundle size
const size = (fs.statSync(BUILD_FILE).size / 1024).toFixed(2);
console.log(`Bundle size:   ${size} KB`);

// Report block count via getInfo()
if (registeredExtension && typeof registeredExtension.getInfo === 'function') {
  try {
    const info = registeredExtension.getInfo();
    const blockCount = info?.blocks?.length ?? 0;
    console.log(`Blocks:        ${blockCount} (extension id: ${info?.id})`);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error(`Could not call getInfo() on registered extension: ${detail}`);
  }
} else {
  console.warn('Could not retrieve block info from registered extension.');
}

// Functional tests for dict_find_path on array-only dictionaries
let testsFailed = 0;
const assert = (description, actual, expected) => {
  if (String(actual) !== String(expected)) {
    console.error(`FAIL [${description}]: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    testsFailed++;
  } else {
    console.log(`PASS [${description}]`);
  }
};

if (registeredExtension) {
  const ext = registeredExtension;

  // Single-element array: searching for the only element should return index '0'
  ext.array_init({ DICT: 'test_arr' });
  ext.array_push({ VAL: 'apple', KEY: '', DICT: 'test_arr' });
  assert('single-element array: finds element at index 0', ext.dict_find_path({ VAL: 'apple', DICT: 'test_arr' }), '0');

  // Multi-element array: searching for elements at various positions
  ext.array_init({ DICT: 'test_arr2' });
  ext.array_push({ VAL: 'alpha', KEY: '', DICT: 'test_arr2' });
  ext.array_push({ VAL: 'beta', KEY: '', DICT: 'test_arr2' });
  ext.array_push({ VAL: 'gamma', KEY: '', DICT: 'test_arr2' });
  assert('multi-element array: finds first element at index 0', ext.dict_find_path({ VAL: 'alpha', DICT: 'test_arr2' }), '0');
  assert('multi-element array: finds middle element at index 1', ext.dict_find_path({ VAL: 'beta', DICT: 'test_arr2' }), '1');
  assert('multi-element array: finds last element at index 2', ext.dict_find_path({ VAL: 'gamma', DICT: 'test_arr2' }), '2');
  assert('multi-element array: returns empty for missing value', ext.dict_find_path({ VAL: 'delta', DICT: 'test_arr2' }), '');

  // Numeric values in array
  ext.array_init({ DICT: 'test_nums' });
  ext.array_push({ VAL: '42', KEY: '', DICT: 'test_nums' });
  ext.array_push({ VAL: '100', KEY: '', DICT: 'test_nums' });
  assert('numeric array: finds value at index 0', ext.dict_find_path({ VAL: '42', DICT: 'test_nums' }), '0');
  assert('numeric array: finds value at index 1', ext.dict_find_path({ VAL: '100', DICT: 'test_nums' }), '1');
}

if (testsFailed > 0) {
  console.error(`\n${testsFailed} test(s) failed.`);
  process.exit(1);
} else {
  console.log('\nAll functional tests passed.');
}
