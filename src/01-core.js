const dictionaries = new Map();

// Fix: Guard against missing VM in sandboxed environment
if (Scratch.vm && Scratch.vm.runtime) {
  Scratch.vm.runtime.on('RUNTIME_DISPOSED', () => {
    dictionaries.clear();
  });
}

const isDangerousKey = key => key === '__proto__' || key === 'constructor' || key === 'prototype';

const sanitize = obj => {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      obj[i] = sanitize(obj[i]);
    }
    return obj;
  }

  for (const key of Object.keys(obj)) {
    if (isDangerousKey(key)) {
      delete obj[key];
    } else {
      obj[key] = sanitize(obj[key]);
    }
  }
  return obj;
};

const isPlainObject = val => !!val && typeof val === 'object' && !Array.isArray(val);

const tryParse = val => {
  if (typeof val !== 'string') return val;
  const v = val.trim();
  if ((v.startsWith('{') && v.endsWith('}')) || (v.startsWith('[') && v.endsWith(']'))) {
    try {
      return sanitize(JSON.parse(v));
    } catch (_e) {
      return val;
    }
  }
  return val;
};

const resolvePath = (root, pathString, autoCreate = false) => {
  if (!pathString || pathString === '') {
    return {
      target: root,
      key: null,
    };
  }

  const placeholder = '\uFFFF';
  const protectedPath = pathString.replace(/\\\./g, placeholder);
  const parts = protectedPath.split('.').map(p => p.replace(new RegExp(placeholder, 'g'), '.'));

  let current = root;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];

    if (isDangerousKey(part)) {
      return null;
    }

    if (typeof current !== 'object' || current === null) {
      return null;
    }

    if (current[part] === undefined) {
      if (autoCreate) {
        const nextPart = parts[i + 1];
        current[part] = isNaN(Number(nextPart)) ? {} : [];
      } else {
        return null;
      }
    }

    current = current[part];
  }

  if (typeof current !== 'object' || current === null) return null;

  const finalKey = parts[parts.length - 1];
  if (isDangerousKey(finalKey)) {
    return null;
  }

  return {
    target: current,
    key: finalKey,
  };
};

const deepMerge = (target, source) => {
  for (const key of Object.keys(source)) {
    if (isDangerousKey(key)) continue;

    if (isPlainObject(source[key]) && isPlainObject(target[key])) {
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
};

const formatOutput = value => {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (typeof value === 'object') return JSON.stringify(value);
  return value;
};

// --- New Helper Functions ---

const deepContains = (obj, target) => {
  // String comparison for Scratch-like behavior
  if (String(obj) === String(target)) return true;
  if (typeof obj === 'object' && obj !== null) {
    return Object.values(obj).some(val => deepContains(val, target));
  }
  return false;
};

const deepFindPath = (obj, target, currentPath = '') => {
  if (typeof obj !== 'object' || obj === null) {
    if (String(obj) === String(target)) return currentPath;
  } else {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // Skip internal props
        if (isDangerousKey(key)) continue;

        const newPath = currentPath ? `${currentPath}.${key}` : key;
        const found = deepFindPath(obj[key], target, newPath);
        if (found !== '') return found;
      }
    }
  }
  return '';
};

const flattenObject = (obj, prefix = '', res = {}) => {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (isDangerousKey(key)) continue;

      const val = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (typeof val === 'object' && val !== null) {
        flattenObject(val, newKey, res);
      } else {
        res[newKey] = val;
      }
    }
  }
  return res;
};

const getArrayForKey = (DICT, KEY) => {
  if (!dictionaries.has(DICT)) return null;
  const root = dictionaries.get(DICT);
  if (KEY === '') {
    return Array.isArray(root) ? root : null;
  }
  const loc = resolvePath(root, KEY);
  if (!loc || !Array.isArray(loc.target[loc.key])) return null;
  return loc.target[loc.key];
};

class DictionariesPlus {
  getInfo() {
    return {
      id: 'kxdictionariesplus',
      name: Scratch.translate('Dictionaries+'),
      color1: '#9639cd',
      color2: '#8432b5',
      color3: '#732b9d',
      blocks: [
        {
          opcode: 'dict_list',
          blockType: Scratch.BlockType.REPORTER,
          text: Scratch.translate('list of dictionaries'),
        },
        {
          opcode: 'dict_stringify',
          blockType: Scratch.BlockType.REPORTER,
          text: Scratch.translate('stringify dictionary [DICT] into JSON'),
          arguments: {
            DICT: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'foo',
            },
          },
        },
        {
          opcode: 'dict_get',
          blockType: Scratch.BlockType.REPORTER,
          text: Scratch.translate('key [KEY] from dictionary [DICT]'),
          arguments: {
            KEY: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'bar',
            },
            DICT: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'foo',
            },
          },
        },
        {
          opcode: 'dict_keys',
          blockType: Scratch.BlockType.REPORTER,
          text: Scratch.translate('keys of path [KEY] in dictionary [DICT]'),
          arguments: {
            KEY: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'items',
            },
            DICT: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'foo',
            },
          },
        },
        {
          opcode: 'dict_length',
          blockType: Scratch.BlockType.REPORTER,
          text: Scratch.translate('length of [KEY] in [DICT]'),
          arguments: {
            KEY: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'items',
            },
            DICT: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'foo',
            },
          },
        },
        {
          opcode: 'dict_type',
          blockType: Scratch.BlockType.REPORTER,
          text: Scratch.translate('type of [KEY] in [DICT]'),
          arguments: {
            KEY: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'bar',
            },
            DICT: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'foo',
            },
          },
        },

        '---',
        // Advanced Queries
        {
          opcode: 'dict_contains_value',
          blockType: Scratch.BlockType.BOOLEAN,
          text: Scratch.translate('is value [VAL] mentioned anywhere in [DICT]?'),
          arguments: {
            VAL: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'search_term',
            },
            DICT: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'foo',
            },
          },
        },
        {
          opcode: 'dict_find_path',
          blockType: Scratch.BlockType.REPORTER,
          text: Scratch.translate('path to first [VAL] in [DICT]'),
          arguments: {
            VAL: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'search_term',
            },
            DICT: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'foo',
            },
          },
        },
        {
          opcode: 'dict_filter_array',
          blockType: Scratch.BlockType.REPORTER,
          text: Scratch.translate('filter array [KEY] in [DICT] where [SUBKEY] [OP] [VAL]'),
          arguments: {
            KEY: { type: Scratch.ArgumentType.STRING, defaultValue: 'users' },
            DICT: { type: Scratch.ArgumentType.STRING, defaultValue: 'foo' },
            SUBKEY: { type: Scratch.ArgumentType.STRING, defaultValue: 'id' },
            OP: { type: Scratch.ArgumentType.STRING, menu: 'filter_ops' },
            VAL: { type: Scratch.ArgumentType.STRING, defaultValue: '1' },
          },
        },
        {
          opcode: 'dict_aggregate',
          blockType: Scratch.BlockType.REPORTER,
          text: Scratch.translate('get [OP] of [KEY] in [DICT]'),
          arguments: {
            OP: { type: Scratch.ArgumentType.STRING, menu: 'agg_ops' },
            KEY: { type: Scratch.ArgumentType.STRING, defaultValue: 'scores' },
            DICT: { type: Scratch.ArgumentType.STRING, defaultValue: 'foo' },
          },
        },
        {
          opcode: 'dict_flatten',
          blockType: Scratch.BlockType.REPORTER,
          text: Scratch.translate('flatten dictionary [DICT] to JSON'),
          arguments: {
            DICT: { type: Scratch.ArgumentType.STRING, defaultValue: 'foo' },
          },
        },

        '---',

        {
          opcode: 'dict_check_prop',
          blockType: Scratch.BlockType.BOOLEAN,
          text: Scratch.translate('key [KEY] in [DICT] [CHECK]?'),
          arguments: {
            KEY: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'bar',
            },
            DICT: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'foo',
            },
            CHECK: {
              type: Scratch.ArgumentType.STRING,
              menu: 'check_menu',
            },
          },
        },

        '---',

        {
          opcode: 'dict_manage_key',
          blockType: Scratch.BlockType.COMMAND,
          text: Scratch.translate('key [KEY] in [DICT]: [ACTION] [VAL]'),
          arguments: {
            KEY: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'bar',
            },
            DICT: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'foo',
            },
            ACTION: {
              type: Scratch.ArgumentType.STRING,
              menu: 'key_action_menu',
            },
            VAL: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'baz',
            },
          },
        },
        {
          opcode: 'dict_manage',
          blockType: Scratch.BlockType.COMMAND,
          text: Scratch.translate('dictionary [DICT]: [ACTION] [DATA]'),
          arguments: {
            DICT: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'foo',
            },
            ACTION: {
              type: Scratch.ArgumentType.STRING,
              menu: 'dict_action_menu',
            },
            DATA: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: '{"bar": "baz"}',
            },
          },
        },
        {
          opcode: 'dict_clone',
          blockType: Scratch.BlockType.COMMAND,
          text: Scratch.translate('clone dictionary [SRC] as [DEST]'),
          arguments: {
            SRC: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'original',
            },
            DEST: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'copy',
            },
          },
        },
        {
          opcode: 'dict_merge',
          blockType: Scratch.BlockType.COMMAND,
          text: Scratch.translate('merge dictionary [SRC] into [DEST]'),
          arguments: {
            SRC: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'data',
            },
            DEST: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'foo',
            },
          },
        },
        {
          opcode: 'dict_export_base64',
          blockType: Scratch.BlockType.REPORTER,
          text: Scratch.translate('export dictionary [DICT] as Base64'),
          arguments: {
            DICT: { type: Scratch.ArgumentType.STRING, defaultValue: 'foo' },
          },
        },

        '---',
        // Array Operations
        {
          opcode: 'array_init',
          blockType: Scratch.BlockType.COMMAND,
          text: Scratch.translate('initialize [DICT] as empty array'),
          arguments: {
            DICT: { type: Scratch.ArgumentType.STRING, defaultValue: 'myArray' },
          },
        },
        {
          opcode: 'array_push',
          blockType: Scratch.BlockType.COMMAND,
          text: Scratch.translate('push [VAL] to array [KEY] in [DICT]'),
          arguments: {
            VAL: { type: Scratch.ArgumentType.STRING, defaultValue: 'item' },
            KEY: { type: Scratch.ArgumentType.STRING, defaultValue: '' },
            DICT: { type: Scratch.ArgumentType.STRING, defaultValue: 'myArray' },
          },
        },
        {
          opcode: 'array_get_item',
          blockType: Scratch.BlockType.REPORTER,
          text: Scratch.translate('item [INDEX] of array [KEY] in [DICT]'),
          arguments: {
            INDEX: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
            KEY: { type: Scratch.ArgumentType.STRING, defaultValue: '' },
            DICT: { type: Scratch.ArgumentType.STRING, defaultValue: 'myArray' },
          },
        },
        {
          opcode: 'array_set_item',
          blockType: Scratch.BlockType.COMMAND,
          text: Scratch.translate('replace item [INDEX] of array [KEY] in [DICT] with [VAL]'),
          arguments: {
            INDEX: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
            KEY: { type: Scratch.ArgumentType.STRING, defaultValue: '' },
            DICT: { type: Scratch.ArgumentType.STRING, defaultValue: 'myArray' },
            VAL: { type: Scratch.ArgumentType.STRING, defaultValue: 'item' },
          },
        },
        {
          opcode: 'array_insert_item',
          blockType: Scratch.BlockType.COMMAND,
          text: Scratch.translate('insert [VAL] at [INDEX] in array [KEY] in [DICT]'),
          arguments: {
            VAL: { type: Scratch.ArgumentType.STRING, defaultValue: 'item' },
            INDEX: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
            KEY: { type: Scratch.ArgumentType.STRING, defaultValue: '' },
            DICT: { type: Scratch.ArgumentType.STRING, defaultValue: 'myArray' },
          },
        },
        {
          opcode: 'array_remove_item',
          blockType: Scratch.BlockType.COMMAND,
          text: Scratch.translate('delete item [INDEX] from array [KEY] in [DICT]'),
          arguments: {
            INDEX: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
            KEY: { type: Scratch.ArgumentType.STRING, defaultValue: '' },
            DICT: { type: Scratch.ArgumentType.STRING, defaultValue: 'myArray' },
          },
        },
        {
          opcode: 'array_join',
          blockType: Scratch.BlockType.REPORTER,
          text: Scratch.translate('items of array [KEY] in [DICT] joined by [SEP]'),
          arguments: {
            KEY: { type: Scratch.ArgumentType.STRING, defaultValue: '' },
            DICT: { type: Scratch.ArgumentType.STRING, defaultValue: 'myArray' },
            SEP: { type: Scratch.ArgumentType.STRING, defaultValue: ', ' },
          },
        },
      ],
      menus: {
        check_menu: {
          acceptReporters: true,
          items: ['is defined', 'is null', 'is array', 'is dictionary (object)'],
        },
        key_action_menu: {
          acceptReporters: true,
          items: ['set to', 'change by', 'push', 'delete'],
        },
        dict_action_menu: {
          acceptReporters: true,
          items: ['load JSON', 'clear', 'delete'],
        },
        filter_ops: {
          acceptReporters: true,
          items: ['=', '!=', '>', '<', 'contains'],
        },
        agg_ops: {
          acceptReporters: true,
          items: ['sum', 'average', 'min', 'max'],
        },
      },
    };
  }

  dict_list() {
    return JSON.stringify(Array.from(dictionaries.keys()));
  }

  dict_stringify({ DICT }) {
    if (!dictionaries.has(DICT)) return '{}';
    return JSON.stringify(dictionaries.get(DICT));
  }

  dict_get({ KEY, DICT }) {
    if (!dictionaries.has(DICT)) return 'undefined';
    const root = dictionaries.get(DICT);

    if (KEY === '') return formatOutput(root);

    const loc = resolvePath(root, KEY);
    if (!loc || loc.target === null || loc.target[loc.key] === undefined) {
      return 'undefined';
    }

    return formatOutput(loc.target[loc.key]);
  }

  dict_keys({ KEY, DICT }) {
    if (!dictionaries.has(DICT)) return '[]';
    const root = dictionaries.get(DICT);

    if (!KEY) {
      if (typeof root === 'object' && root !== null) {
        return JSON.stringify(Object.keys(root));
      }
      return '[]';
    }

    const loc = resolvePath(root, KEY);
    if (!loc || loc.target === null || loc.target[loc.key] === undefined) {
      return '[]';
    }

    const val = loc.target[loc.key];
    if (typeof val === 'object' && val !== null) {
      return JSON.stringify(Object.keys(val));
    }
    return '[]';
  }

  dict_length({ KEY, DICT }) {
    if (!dictionaries.has(DICT)) return 0;
    const root = dictionaries.get(DICT);

    if (!KEY) {
      if (Array.isArray(root)) return root.length;
      if (typeof root === 'object' && root !== null) return Object.keys(root).length;
      return 0;
    }

    const loc = resolvePath(root, KEY);
    if (!loc || loc.target === null || loc.target[loc.key] === undefined) return 0;

    const val = loc.target[loc.key];
    if (Array.isArray(val)) return val.length;
    if (typeof val === 'string') return val.length;
    if (typeof val === 'object' && val !== null) return Object.keys(val).length;
    return 0;
  }

  dict_type({ KEY, DICT }) {
    if (!dictionaries.has(DICT)) return 'undefined';
    const root = dictionaries.get(DICT);

    if (KEY === '') {
      if (root === null) return 'null';

      if (Array.isArray(root)) return 'array';
      return typeof root;
    }

    const loc = resolvePath(root, KEY);

    if (!loc || loc.target === null || loc.target[loc.key] === undefined) {
      return 'undefined';
    }

    const val = loc.target[loc.key];
    if (val === null) return 'null';
    if (Array.isArray(val)) return 'array';
    return typeof val;
  }

  // --- New Methods ---

  dict_contains_value({ VAL, DICT }) {
    if (!dictionaries.has(DICT)) return false;
    const root = dictionaries.get(DICT);
    return deepContains(root, VAL);
  }

  dict_find_path({ VAL, DICT }) {
    if (!dictionaries.has(DICT)) return '';
    const root = dictionaries.get(DICT);
    return deepFindPath(root, VAL);
  }

  dict_flatten({ DICT }) {
    if (!dictionaries.has(DICT)) return '{}';
    const root = dictionaries.get(DICT);
    if (typeof root !== 'object' || root === null) return '{}';
    const flat = flattenObject(root);
    return JSON.stringify(flat);
  }

  dict_filter_array({ KEY, DICT, SUBKEY, OP, VAL }) {
    if (!dictionaries.has(DICT)) return '[]';
    const root = dictionaries.get(DICT);

    let arr = root;
    if (KEY !== '') {
      const loc = resolvePath(root, KEY);
      if (!loc || !Array.isArray(loc.target[loc.key])) return '[]';
      arr = loc.target[loc.key];
    }

    if (!Array.isArray(arr)) return '[]';

    const res = arr.filter(item => {
      if (typeof item !== 'object' || item === null) return false;

      // Resolve subkey path relative to item
      const loc = resolvePath(item, SUBKEY);
      if (!loc || loc.target[loc.key] === undefined) return false;

      const prop = loc.target[loc.key];
      const compareVal = tryParse(VAL); // Handle number comparisons correctly

      if (OP === '=') return String(prop) === String(compareVal);
      if (OP === '!=') return String(prop) !== String(compareVal);
      if (OP === '>') return Number(prop) > Number(compareVal);
      if (OP === '<') return Number(prop) < Number(compareVal);
      if (OP === 'contains') return String(prop).includes(String(compareVal));
      return false;
    });

    return JSON.stringify(res);
  }

  dict_aggregate({ OP, KEY, DICT }) {
    if (!dictionaries.has(DICT)) return 0;
    const root = dictionaries.get(DICT);

    let arr = root;
    if (KEY !== '') {
      const loc = resolvePath(root, KEY);
      if (!loc) return 0;
      arr = loc.target[loc.key];
    }

    if (!Array.isArray(arr)) return 0;

    // Convert to numbers, filter NaNs
    const nums = arr.map(Number).filter(n => !isNaN(n));
    if (nums.length === 0) return 0;

    if (OP === 'sum') return nums.reduce((a, b) => a + b, 0);
    if (OP === 'average') return nums.reduce((a, b) => a + b, 0) / nums.length;
    if (OP === 'min') return nums.reduce((a, b) => Math.min(a, b), nums[0]);
    if (OP === 'max') return nums.reduce((a, b) => Math.max(a, b), nums[0]);
    return 0;
  }

  dict_export_base64({ DICT }) {
    if (!dictionaries.has(DICT)) return '';
    const str = JSON.stringify(dictionaries.get(DICT));
    try {
      return btoa(str);
    } catch (_e) {
      // Fallback for Unicode strings
      return btoa(
        encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) =>
          String.fromCharCode(parseInt(p1, 16))
        )
      );
    }
  }

  // --- End New Methods ---

  dict_check_prop({ KEY, DICT, CHECK }) {
    if (!dictionaries.has(DICT)) return false;
    const root = dictionaries.get(DICT);

    if (KEY === '') {
      if (CHECK === 'is defined') return true;
      if (CHECK === 'is null') return root === null;

      if (CHECK === 'is array') return Array.isArray(root);
      if (CHECK === 'is dictionary (object)') return isPlainObject(root);
      return false;
    }

    const loc = resolvePath(root, KEY);

    if (!loc || loc.target === null) return false;
    const val = loc.target[loc.key];

    if (CHECK === 'is defined') return Object.prototype.hasOwnProperty.call(loc.target, loc.key);
    if (CHECK === 'is null') return val === null;
    if (CHECK === 'is array') return Array.isArray(val);
    if (CHECK === 'is dictionary (object)') return isPlainObject(val);
    return false;
  }

  dict_manage_key({ KEY, DICT, ACTION, VAL }) {
    if (!dictionaries.has(DICT)) {
      if (ACTION === 'delete') return;
      dictionaries.set(DICT, KEY === '' && ACTION === 'push' ? [] : {});
    }
    const root = dictionaries.get(DICT);

    if (KEY === '') {
      if (ACTION === 'set to') {
        const newVal = tryParse(VAL);

        if (typeof newVal === 'object' && newVal !== null) {
          dictionaries.set(DICT, newVal);
        }
      } else if (ACTION === 'delete') {
        dictionaries.delete(DICT);
      } else if (ACTION === 'push') {
        if (Array.isArray(root)) {
          root.push(tryParse(VAL));
        }
      }
      return;
    }

    const autoCreate = ACTION !== 'delete';
    const loc = resolvePath(root, KEY, autoCreate);

    if (!loc) return;

    if (ACTION === 'set to') {
      loc.target[loc.key] = tryParse(VAL);
    } else if (ACTION === 'change by') {
      const currentVal = loc.target[loc.key];

      if (typeof currentVal === 'object' && currentVal !== null) return;

      const startVal = Number(currentVal);
      const delta = Number(VAL);

      const safeStart = isNaN(startVal) ? 0 : startVal;
      const safeDelta = isNaN(delta) ? 0 : delta;

      loc.target[loc.key] = safeStart + safeDelta;
    } else if (ACTION === 'push') {
      let targetVal = loc.target[loc.key];

      if (targetVal !== undefined && !Array.isArray(targetVal)) {
        if (typeof targetVal === 'object' && targetVal !== null) return;
        targetVal = [targetVal];
        loc.target[loc.key] = targetVal;
      }

      if (targetVal === undefined) {
        loc.target[loc.key] = [];
        targetVal = loc.target[loc.key];
      }
      targetVal.push(tryParse(VAL));
    } else if (ACTION === 'delete') {
      if (Array.isArray(loc.target)) {
        const index = Math.trunc(Number(loc.key));
        if (!isNaN(index) && index >= 0 && index < loc.target.length) {
          loc.target.splice(index, 1);
        }
      } else {
        delete loc.target[loc.key];
      }
    }
  }

  dict_manage({ DICT, ACTION, DATA }) {
    if (ACTION === 'delete') {
      if (dictionaries.has(DICT)) dictionaries.delete(DICT);
    } else if (ACTION === 'clear') {
      if (dictionaries.has(DICT)) {
        const current = dictionaries.get(DICT);
        dictionaries.set(DICT, Array.isArray(current) ? [] : {});
      }
    } else if (ACTION === 'load JSON') {
      let parsed;
      try {
        parsed = sanitize(JSON.parse(DATA));
      } catch (_e) {
        parsed = {
          error: 'Invalid JSON',
        };
      }

      if (typeof parsed !== 'object' || parsed === null) {
        parsed = {
          error: 'Invalid JSON Structure',
        };
      }

      dictionaries.set(DICT, parsed);
    }
  }

  dict_clone({ SRC, DEST }) {
    if (!dictionaries.has(SRC)) return;
    const src = dictionaries.get(SRC);

    try {
      if (typeof structuredClone === 'function') {
        dictionaries.set(DEST, structuredClone(src));
      } else {
        dictionaries.set(DEST, JSON.parse(JSON.stringify(src)));
      }
    } catch (e) {
      console.warn('Dictionaries+: Clone failed', e);
    }
  }

  dict_merge({ SRC, DEST }) {
    if (!dictionaries.has(SRC)) return;
    const srcData = dictionaries.get(SRC);

    if (!dictionaries.has(DEST)) {
      try {
        if (typeof structuredClone === 'function') {
          dictionaries.set(DEST, structuredClone(srcData));
        } else {
          dictionaries.set(DEST, JSON.parse(JSON.stringify(srcData)));
        }
      } catch (e) {
        console.warn('Dictionaries+: Merge (clone) failed', e);
      }
      return;
    }

    const destData = dictionaries.get(DEST);

    if (isPlainObject(srcData) && isPlainObject(destData)) {
      deepMerge(destData, srcData);
    } else {
      try {
        if (typeof structuredClone === 'function') {
          dictionaries.set(DEST, structuredClone(srcData));
        } else {
          dictionaries.set(DEST, JSON.parse(JSON.stringify(srcData)));
        }
      } catch (e) {
        console.warn('Dictionaries+: Merge (overwrite) failed', e);
      }
    }
  }

  // --- Array Operation Methods ---

  array_init({ DICT }) {
    dictionaries.set(DICT, []);
  }

  array_push({ VAL, KEY, DICT }) {
    if (!dictionaries.has(DICT)) {
      const firstSeg = KEY.split('.')[0];
      dictionaries.set(DICT, KEY === '' || /^\d/.test(firstSeg) ? [] : {});
    }
    const root = dictionaries.get(DICT);

    if (KEY === '') {
      if (Array.isArray(root)) {
        root.push(tryParse(VAL));
      }
      return;
    }

    const loc = resolvePath(root, KEY, true);
    if (!loc) return;

    let arr = loc.target[loc.key];
    if (arr === undefined) {
      loc.target[loc.key] = [];
      arr = loc.target[loc.key];
    }
    if (Array.isArray(arr)) {
      arr.push(tryParse(VAL));
    }
  }

  array_get_item({ INDEX, KEY, DICT }) {
    const arr = getArrayForKey(DICT, KEY);
    if (arr === null) return 'undefined';

    const idx = Math.trunc(Number(INDEX));
    if (isNaN(idx) || idx < 0 || idx >= arr.length) return 'undefined';
    return formatOutput(arr[idx]);
  }

  array_set_item({ INDEX, KEY, DICT, VAL }) {
    const arr = getArrayForKey(DICT, KEY);
    if (arr === null) return;

    const idx = Math.trunc(Number(INDEX));
    if (isNaN(idx) || idx < 0 || idx >= arr.length) return;
    arr[idx] = tryParse(VAL);
  }

  array_insert_item({ VAL, INDEX, KEY, DICT }) {
    const arr = getArrayForKey(DICT, KEY);
    if (arr === null) return;

    const idx = Math.trunc(Number(INDEX));
    if (isNaN(idx) || idx < 0) return;
    arr.splice(Math.min(idx, arr.length), 0, tryParse(VAL));
  }

  array_remove_item({ INDEX, KEY, DICT }) {
    const arr = getArrayForKey(DICT, KEY);
    if (arr === null) return;

    const idx = Math.trunc(Number(INDEX));
    if (isNaN(idx) || idx < 0 || idx >= arr.length) return;
    arr.splice(idx, 1);
  }

  array_join({ KEY, DICT, SEP }) {
    const arr = getArrayForKey(DICT, KEY);
    if (arr === null) return '';
    return arr
      .map(item => (typeof item === 'object' ? JSON.stringify(item) : String(item)))
      .join(SEP);
  }
}

Scratch.extensions.register(new DictionariesPlus());
