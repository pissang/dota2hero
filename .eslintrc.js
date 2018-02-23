
module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
    node: true
  },
  globals: {
    Promise: true,
    $: true,
    jQuery: true,
    echarts: true,
    clay: true,
    Float32Array: true,
    Uint32Array: true,
    Float64Array: true,
    Uint8Array: true,
    Uint16Array: true
  },

  rules: {
    'eqeqeq': [2, 'allow-null'],
    'quotes': [2, 'single', {
      allowTemplateLiterals: true
    }],
    'no-dupe-keys': 2,
    'no-func-assign': 2,
    'no-invalid-regexp': 2,
    'no-unreachable': 2,
    'valid-typeof': 2,
    'no-loop-func': 1,
    'no-lone-blocks': 1,
    'no-undef': 2,
    'no-unused-vars': 1,
    // 'no-use-before-define': [2, {
    //   functions: false,
    // }],
    'no-unneeded-ternary': 2,
    'no-self-compare': 2,
    'brace-style': [2, 'stroustrup', {
      allowSingleLine: true
    }],
    'comma-style': [2, 'last'],
    'comma-spacing': [2, {
      'before': false,
      'after': true
    }],
    'no-spaced-func': 2,
    'no-trailing-spaces': 2,
    'one-var': [1, 'never'],
    'no-duplicate-imports': 2,
    'block-scoped-var': 2,
    "indent": [1, 2, {
      SwitchCase: 1
    }],
    "key-spacing": [2, {
      afterColon: true,
      beforeColon: false,
      mode: "strict"
    }],
    "comma-spacing": [2, {
      before: false,
      after: true
    }],
    "semi": [2, 'always']
  }
}